"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";

/* ─── Scroll-triggered animation observer ─── */
export function ScrollObserver() {
  useEffect(() => {
    const selectors = ".fade-in, .slide-up, .slide-in-left, .slide-in-right, .scale-in";
    const els = document.querySelectorAll(selectors);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}

/* ─── FAQ accordion item ─── */
export function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      onClick={() => setOpen(!open)}
      className="cursor-pointer flex flex-col rounded-2xl border-[1.5px] border-[var(--light-gray)] bg-white p-7 transition-all duration-300 hover:shadow-md hover:border-[var(--orange)]/20"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-[var(--dark)]">{q}</h3>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[var(--mid-gray)] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pt-3 text-sm leading-[1.6] text-[var(--mid-gray)]">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Typing effect for hero subtitle ─── */
export function TypingText({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span className={className}>
      {displayed}
      {displayed.length < text.length && started && (
        <span
          className="inline-block w-[2px] h-[1em] bg-[var(--mid-gray)] ml-[2px] align-text-bottom"
          style={{ animation: "cursor-blink 0.8s step-end infinite" }}
        />
      )}
    </span>
  );
}

/* ─── Count-up animation for stats ─── */
export function CountUp({
  value,
  suffix = "",
  prefix = "",
  className = "",
  duration = 2000,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const stepDuration = duration / steps;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      const progress = current / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (current >= steps) {
        setCount(value);
        clearInterval(interval);
      }
    }, stepDuration);
    return () => clearInterval(interval);
  }, [started, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{started ? count : 0}{suffix}
    </span>
  );
}

/* ─── Testimonial auto-carousel ─── */
export function TestimonialCarousel({
  children,
}: {
  children: React.ReactNode[];
}) {
  const [active, setActive] = useState(0);
  const total = children.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total]);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${active * (100 / total)}%)`, width: `${total * 100}%` }}
      >
        {children.map((child, i) => (
          <div key={i} style={{ width: `${100 / total}%` }} className="px-3">
            {child}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active
                ? "w-6 bg-[var(--orange)]"
                : "w-2 bg-[var(--mid-gray)]/30 hover:bg-[var(--mid-gray)]/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Parallax decoration ─── */
export function ParallaxDecoration({
  children,
  speed = 0.1,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const viewCenter = window.innerHeight / 2;
    setOffset((center - viewCenter) * speed);
  }, [speed]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div
      ref={ref}
      className={`pointer-events-none ${className}`}
      style={{ transform: `translateY(${offset}px)` }}
    >
      {children}
    </div>
  );
}
