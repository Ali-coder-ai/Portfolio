import { SplitText } from "gsap/SplitText";
import gsap from "gsap";
import { smoother } from "../Navbar";

export function initialFX() {
  document.body.style.overflowY = "auto";
  document.getElementsByTagName("main")[0].classList.add("main-active");

  // Prevent GSAP from "catching up" after a dropped frame — stops the
  // sudden lurch when the browser is busy during the expand animation.
  gsap.ticker.lagSmoothing(0);

  // Reset scroll position to 0 before unpausing so ScrollSmoother has
  // zero accumulated distance to "catch up" on — this eliminates the
  // sudden speed burst mid-animation.
  smoother.scrollTo(0, false);

  // Unpause ScrollSmoother right after the expand animation finishes
  // (1.25s expand + small buffer = ~1300ms).
  setTimeout(() => {
    smoother.paused(false);
  }, 1300);

  gsap.to("body", {
    backgroundColor: "#0a0d12",
    duration: 0.5,
    delay: 0.8,  // Wait for loading screen fade-out to complete before darkening
  });

  const isMobile = window.matchMedia("(pointer: coarse)").matches;

  var landingText = new SplitText(
    [".landing-info-role", ".landing-intro-greeting", ".landing-intro h1"],
    {
      type: "chars,lines",
      linesClass: "split-line",
    }
  );

  // Mobile: skip filter:blur — animating blur per-char on mobile causes
  // compositor layer explosions (one layer per char) and heavy repaints.
  // Desktop: unchanged.
  // NOTE: delay removed — animations start immediately when initialFX() is called
  if (isMobile) {
    gsap.fromTo(
      landingText.chars,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        y: 0,
        stagger: 0.018,
      }
    );
  } else {
    gsap.fromTo(
      landingText.chars,
      { opacity: 0, y: 80, filter: "blur(5px)" },
      {
        opacity: 1,
        duration: 1.2,
        filter: "blur(0px)",
        clearProps: "filter",
        ease: "power3.inOut",
        y: 0,
        stagger: 0.025,
      }
    );
  }

  let TextProps = { type: "chars,lines", linesClass: "split-h2" };

  var landingText2 = new SplitText(".landing-h2-info", TextProps);

  if (isMobile) {
    gsap.fromTo(
      landingText2.chars,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        y: 0,
        stagger: 0.018,
      }
    );
  } else {
    gsap.fromTo(
      landingText2.chars,
      { opacity: 0, y: 80, filter: "blur(5px)" },
      {
        opacity: 1,
        duration: 1.2,
        filter: "blur(0px)",
        clearProps: "filter",
        ease: "power3.inOut",
        y: 0,
        stagger: 0.025,
      }
    );
  }

  gsap.fromTo(
    ".landing-info-h2",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      duration: isMobile ? 0.7 : 1.2,
      ease: "power1.inOut",
      y: 0,
    }
  );

  gsap.fromTo(
    [".header", ".icons-section", ".nav-fade"],
    { opacity: 0 },
    {
      opacity: 1,
      duration: isMobile ? 0.6 : 1.2,
      ease: "power1.inOut",
    }
  );

  var landingText3 = new SplitText(".landing-h2-info-1", TextProps);
  var landingText4 = new SplitText(".landing-h2-1", TextProps);
  var landingText5 = new SplitText(".landing-h2-2", TextProps);

  // Mobile: skip the infinite loop animation — it runs forever on a repeat:-1
  // timeline, consuming GPU ticks even when the section is off-screen.
  // The text is shown in its initial state instead.
  if (!isMobile) {
    LoopText(landingText2, landingText3);
    LoopText(landingText4, landingText5);
  } else {
    // On mobile: hide the absolutely-positioned duplicate words entirely.
    // They exist only for the desktop loop animation (position:absolute, top:0)
    // and would overlap the first words if made visible on mobile.
    // The first words (landingText2, landingText4) are already animated above.
    gsap.set(
      [
        ...landingText3.chars,
        ...landingText5.chars,
      ],
      { opacity: 0, display: "none" }
    );
  }
}

function LoopText(Text1: SplitText, Text2: SplitText) {
  var tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

  tl.fromTo(
    Text2.chars,
    { opacity: 0, y: 80 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power3.inOut",
      y: 0,
      stagger: 0.1,
    },
    0
  )
    .fromTo(
      Text1.chars,
      { y: 80 },
      {
        duration: 1.2,
        ease: "power3.inOut",
        y: 0,
        stagger: 0.1,
      },
      1
    )
    .fromTo(
      Text1.chars,
      { y: 0 },
      {
        y: -80,
        duration: 1.2,
        ease: "power3.inOut",
        stagger: 0.1,
      },
      0
    )
    .to(
      Text2.chars,
      {
        y: -80,
        duration: 1.2,
        ease: "power3.inOut",
        stagger: 0.1,
      },
      1
    );
}
