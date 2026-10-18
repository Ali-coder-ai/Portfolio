import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

interface ParaElement extends HTMLElement {
  anim?: gsap.core.Animation;
  split?: SplitText;
}

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

// Guard so the refresh listener is added ONCE, not on every setSplitText() call.
// Previously: ScrollTrigger.addEventListener("refresh", () => setSplitText())
// was inside setSplitText() — every call added another copy, doubling each time.
let refreshListenerAdded = false;

export default function setSplitText() {
  ScrollTrigger.config({ ignoreMobileResize: true });

  const isMobile = window.innerWidth <= 768;
  const isTouch  = window.matchMedia("(pointer: coarse)").matches;

  const paras: NodeListOf<ParaElement> = document.querySelectorAll(".para");
  const titles: NodeListOf<ParaElement> = document.querySelectorAll(".title");

  const TriggerStart = isMobile
    ? "top 85%"
    : window.innerWidth <= 1024
    ? "top 60%"
    : "20% 60%";

  const ToggleAction = isTouch
    ? "play none none none"
    : "play pause resume reverse";

  const paraDuration  = isMobile ? 0.6  : 1;
  const paraStagger   = isMobile ? 0.01 : 0.02;
  const titleDuration = isMobile ? 0.5  : 0.8;
  const titleStagger  = isMobile ? 0.02 : 0.03;

  paras.forEach((para: ParaElement) => {
    para.classList.add("visible");
    if (para.anim) {
      para.anim.progress(1).kill();
      para.split?.revert();
    }

    para.split = new SplitText(para, {
      type: "lines,words",
      linesClass: "split-line",
    });

    para.anim = gsap.fromTo(
      para.split.words,
      { autoAlpha: 0, y: 60 },
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: para.parentElement?.parentElement,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: paraDuration,
        ease: "power3.out",
        y: 0,
        stagger: paraStagger,
      }
    );
  });

  titles.forEach((title: ParaElement) => {
    if (title.anim) {
      title.anim.progress(1).kill();
      title.split?.revert();
    }
    title.split = new SplitText(title, {
      type: "chars,lines",
      linesClass: "split-line",
    });
    title.anim = gsap.fromTo(
      title.split.chars,
      { autoAlpha: 0, y: 60, rotate: 10 },
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: title.parentElement?.parentElement,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: titleDuration,
        ease: "power2.inOut",
        y: 0,
        rotate: 0,
        stagger: titleStagger,
      }
    );
  });

  // Add the refresh listener only once — not on every setSplitText() call.
  if (!refreshListenerAdded) {
    refreshListenerAdded = true;
    ScrollTrigger.addEventListener("refresh", () => setSplitText());
  }
}
