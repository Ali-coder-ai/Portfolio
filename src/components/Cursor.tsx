import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let hover = false;
    const cursor = cursorRef.current;
    if (!cursor) return;

    const mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const setCursorX = gsap.quickSetter(cursor, "x", "px");
    const setCursorY = gsap.quickSetter(cursor, "y", "px");

    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let rafId: number;
    function loop() {
      if (!hover) {
        const delay = 5;
        cursorPos.x += (mousePos.x - cursorPos.x) / delay;
        cursorPos.y += (mousePos.y - cursorPos.y) / delay;
        setCursorX(cursorPos.x);
        setCursorY(cursorPos.y);
      }
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    const handleMouseOver = (e: Event) => {
      const target = (e.currentTarget || e.target) as HTMLElement;
      const rect = target.getBoundingClientRect();

      if (target.dataset.cursor === "icons") {
        cursor.classList.add("cursor-icons");
        gsap.to(cursor, {
          x: rect.left,
          y: rect.top,
          duration: 0.2,
          overwrite: "auto",
        });
        cursor.style.setProperty("--cursorH", `${rect.height}px`);
        hover = true;
      }
      if (target.dataset.cursor === "disable") {
        cursor.classList.add("cursor-disable");
      }
    };

    const handleMouseOut = () => {
      cursor.classList.remove("cursor-disable", "cursor-icons");
      hover = false;
    };

    const cursorElements = document.querySelectorAll("[data-cursor]");
    cursorElements.forEach((item) => {
      item.addEventListener("mouseenter", handleMouseOver);
      item.addEventListener("mouseleave", handleMouseOut);
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      cursorElements.forEach((item) => {
        item.removeEventListener("mouseenter", handleMouseOver);
        item.removeEventListener("mouseleave", handleMouseOut);
      });
    };
  }, []);

  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;
