import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import { useEffect } from "react";
import HoverLinks from "./HoverLinks";
import gsap from "gsap";

const SocialIcons = () => {
  useEffect(() => {
    const social = document.getElementById("social") as HTMLElement;
    if (!social) return;

    const cleanupFns: (() => void)[] = [];

    social.querySelectorAll("span").forEach((item) => {
      const elem = item as HTMLElement;
      const link = elem.querySelector("a") as HTMLElement;
      if (!link) return;

      // Anchor the icon's center via xPercent/yPercent so the magnetic x/y
      // offset (below) adds on top instead of overwriting the centering.
      gsap.set(link, { xPercent: -50, yPercent: -50 });

      const onMouseMove = (e: MouseEvent) => {
        const rect = elem.getBoundingClientRect();
        const offsetX = e.clientX - (rect.left + rect.width / 2);
        const offsetY = e.clientY - (rect.top + rect.height / 2);
        gsap.to(link, {
          x: offsetX * 0.4,
          y: offsetY * 0.4,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const onMouseLeave = () => {
        gsap.to(link, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.4)",
          overwrite: "auto",
        });
      };

      elem.addEventListener("mousemove", onMouseMove);
      elem.addEventListener("mouseleave", onMouseLeave);

      cleanupFns.push(() => {
        elem.removeEventListener("mousemove", onMouseMove);
        elem.removeEventListener("mouseleave", onMouseLeave);
      });
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        <span>
          <a href="https://github.com/Ali-coder-ai" target="_blank" rel="noreferrer" aria-label="Muhammad Ali on GitHub">
            <FaGithub />
          </a>
        </span>
        <span>
          <a
            href="https://www.linkedin.com/in/muhammad-ali-sde"
            target="_blank"
            rel="noreferrer"
            aria-label="Muhammad Ali on LinkedIn"
          >
            <FaLinkedinIn />
          </a>
        </span>
      </div>
      <a
        className="resume-button"
        href="/Muhammad-Ali-Resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open resume (PDF)"
      >
        <HoverLinks text="RESUME" />
        <span>
          <TbNotes />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
