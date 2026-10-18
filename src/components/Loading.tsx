import { useEffect, useRef, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";
import Marquee from "react-fast-marquee";

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [loaded,   setLoaded]   = useState(false); // adds .loading-complete → shows Welcome
  const [clicked,  setClicked]  = useState(false); // adds .loading-clicked  → expand transition

  // Single fire guard — the whole sequence runs exactly once.
  const sequenceFiredRef = useRef(false);
  // Ref to the wrap element so we can listen to its transitionend.
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (percent < 100) return;
    if (sequenceFiredRef.current) return;
    sequenceFiredRef.current = true;

    // ── Sequential flow ────────────────────────────────────────────────────
    //
    //  STEP 1: add .loading-complete → Welcome text slides in (CSS 1s transition)
    //  STEP 2: wait for Welcome to FULLY finish, then hold 600ms so user can read it
    //  STEP 3: add .loading-clicked → expand circle (CSS 2.2s transition)
    //  STEP 4: wait for expand to FULLY finish via transitionend
    //  STEP 5: run initialFX() and unmount the loading screen
    //
    // Each step is triggered by the COMPLETION of the previous one, not by a
    // guessed delay. CSS transitions are measured by transitionend events.
    // ──────────────────────────────────────────────────────────────────────

    let cancelled = false;
    const cleanups: (() => void)[] = [];

    // Helper: wait for a transitionend on `el` matching `property`, with a
    // hard timeout fallback so we never hang if the event misfires.
    function waitForTransition(
      el: HTMLElement,
      property: string,
      fallbackMs: number
    ): Promise<void> {
      return new Promise((resolve) => {
        let done = false;

        const finish = () => {
          if (done) return;
          done = true;
          el.removeEventListener("transitionend", onEnd);
          clearTimeout(timer);
          resolve();
        };

        const onEnd = (e: TransitionEvent) => {
          if (e.target === el && e.propertyName === property) finish();
        };

        const timer = setTimeout(finish, fallbackMs);
        el.addEventListener("transitionend", onEnd);
        cleanups.push(() => {
          el.removeEventListener("transitionend", onEnd);
          clearTimeout(timer);
        });
      });
    }

    async function runSequence() {
      // Pre-import NOW so there is zero dynamic-import latency at STEP 5.
      const initialFXModule = import("./utils/initialFX");

      // STEP 1: Show Welcome text
      setLoaded(true);

      const containerEl = wrapRef.current?.querySelector(".loading-container") as HTMLElement | null;
      if (containerEl) {
        await waitForTransition(containerEl, "max-width", 1200);
      } else {
        await new Promise<void>((r) => { const t = setTimeout(r, 1200); cleanups.push(() => clearTimeout(t)); });
      }
      if (cancelled) return;

      // STEP 2: Immediately start expand (no hold time)
      // STEP 3: Start expand transition (1.1s)
      setClicked(true);

      // STEP 4: Wait for expand to finish. Fallback = 1.1s + buffer
      const wrapEl = wrapRef.current;
      if (wrapEl) {
        await waitForTransition(wrapEl, "transform", 1200);
      } else {
        await new Promise<void>((r) => { const t = setTimeout(r, 1200); cleanups.push(() => clearTimeout(t)); });
      }
      if (cancelled) return;

      // STEP 5: Unmount loading screen and start portfolio animations simultaneously.
      // setIsLoading(false) removes the overlay; initialFX() starts hero text/nav
      // animations — both happen on the same frame so there is no blank gap.
      const module = await initialFXModule;
      if (cancelled) return;
      setIsLoading(false);
      if (module.initialFX) module.initialFX();
    }

    runSequence();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [percent]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  }

  return (
    <>
      <div className="loading-header">
        <a href="/#" className="loader-title" data-cursor="disable">
          Ali
        </a>
        <div className={`loaderGame ${clicked && "loader-out"}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {[...Array(27)].map((_, index) => (
                <div className="loaderGame-line" key={index}></div>
              ))}
            </div>
            <div className="loaderGame-ball"></div>
          </div>
        </div>
      </div>

      <div className="loading-screen">
        <div className="loading-marquee">
          <Marquee speed={60}>
            <span>Software Engineer</span>
            <span className="marquee-sep">•</span>
            <span>Web &amp; App Developer</span>
            <span className="marquee-sep">•</span>
            <span>UI/UX Designer</span>
            <span className="marquee-sep">•</span>
            <span>Problem Solver</span>
            <span className="marquee-sep">•</span>
          </Marquee>
        </div>

        <div
          ref={wrapRef}
          className={`loading-wrap ${clicked && "loading-clicked"}`}
          onMouseMove={(e) => handleMouseMove(e)}
        >
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded && "loading-complete"}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Loading <span>{percent}%</span>
                </div>
              </div>
              <div className="loading-box"></div>
            </div>
            <div className="loading-content2">
              <span>Welcome</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;

// ─────────────────────────────────────────────────────────────────────────────
// setProgress — single source of truth for the fake progress bar.
// ─────────────────────────────────────────────────────────────────────────────
export const setProgress = (setLoading: (value: number) => void) => {
  let percent: number  = 0;
  let interval: ReturnType<typeof setInterval>;

  const update = (next: number) => {
    const clamped = Math.min(100, next);
    if (clamped > percent) {
      percent = clamped;
      setLoading(percent);
    }
  };

  // Phase 1: 0 → 50
  interval = setInterval(() => {
    if (percent < 50) {
      update(percent + Math.floor(Math.random() * 6) + 2);
    } else {
      clearInterval(interval);
      // Phase 2: 50 → 91
      interval = setInterval(() => {
        if (percent < 91) {
          update(percent + Math.floor(Math.random() * 4) + 1);
        } else {
          clearInterval(interval);
        }
      }, 70);
    }
  }, 70);

  function clear() {
    clearInterval(interval);
    update(100);
  }

  // Phase 3: 91 → 100 (called when 3D model finishes)
  function loaded() {
    return new Promise<number>((resolve) => {
      clearInterval(interval);
      interval = setInterval(() => {
        if (percent < 100) {
          update(percent + 1);
        } else {
          clearInterval(interval);
          resolve(percent);
        }
      }, 2);
    });
  }

  return { loaded, percent, clear };
};
