import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

interface ParaElement extends HTMLElement {
  anim?: gsap.core.Animation;
  split?: SplitText;
}

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

export default function setSplitText() {
  ScrollTrigger.config({ ignoreMobileResize: true });

  const isMobile = window.innerWidth <= 768;
  const isTouch  = window.matchMedia("(pointer: coarse)").matches;

  const paras: NodeListOf<ParaElement> = document.querySelectorAll(".para");
  const titles: NodeListOf<ParaElement> = document.querySelectorAll(".title");

  // Mobile: fire early (top 85%) so text is never already past the viewport.
  // Tablet: top 75%. Desktop: unchanged.
  const TriggerStart = isMobile
    ? "top 85%"
    : window.innerWidth <= 1024
    ? "top 60%"
    : "20% 60%";

  // Mobile: play once only — no reverse on scroll-up (saves scroll repaints).
  // Desktop: unchanged play/pause/resume/reverse.
  const ToggleAction = isTouch
    ? "play none none none"
    : "play pause resume reverse";

  // Mobile: shorter duration + tighter stagger so the animation finishes fast.
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

  ScrollTrigger.addEventListener("refresh", () => setSplitText());
}
