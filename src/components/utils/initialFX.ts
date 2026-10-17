import { SplitText } from "gsap/SplitText";
import gsap from "gsap";
import { smoother } from "../Navbar";

export function initialFX() {
  document.body.style.overflowY = "auto";
  smoother.paused(false);
  document.getElementsByTagName("main")[0].classList.add("main-active");
  gsap.to("body", {
    backgroundColor: "#0a0d12",
    duration: 0.5,
    delay: 1,
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
        delay: 0.2,
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
        delay: 0.3,
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
        delay: 0.2,
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
        delay: 0.3,
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
      delay: isMobile ? 0.4 : 0.8,
    }
  );

  gsap.fromTo(
    [".header", ".icons-section", ".nav-fade"],
    { opacity: 0 },
    {
      opacity: 1,
      duration: isMobile ? 0.6 : 1.2,
      ease: "power1.inOut",
      delay: 0.1,
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
    // Ensure the "second" chars are visible immediately on mobile
    // (they would otherwise stay at opacity:0 waiting for LoopText).
    gsap.set(
      [
        ...landingText3.chars,
        ...landingText5.chars,
      ],
      { opacity: 1, y: 0 }
    );
  }
}

function LoopText(Text1: SplitText, Text2: SplitText) {
  var tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
  const delay = 4;
  const delay2 = delay * 2 + 1;

  tl.fromTo(
    Text2.chars,
    { opacity: 0, y: 80 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power3.inOut",
      y: 0,
      stagger: 0.1,
      delay: delay,
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
        delay: delay2,
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
        delay: delay,
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
        delay: delay2,
      },
      1
    );
}
