import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CloudzLogo } from "./CloudzLogo";

const nav = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#solutions" },
  { label: "Testimonials", href: "#testimonials" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/30 bg-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur-3xl"
          : "border-b border-white/10 bg-transparent backdrop-blur-xl"
      }`}
    >
      <div className="flex h-24 w-full items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center transition-transform hover:scale-105" 
            aria-label="Clouds home"
          >
            <CloudzLogo className="h-10 w-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          </Link>
          <nav className="hidden items-center gap-6 md:flex ml-4">
            {nav.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="text-base font-bold text-white transition-all hover:text-white/80"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full px-3 py-2 text-sm font-bold text-white hover:text-white/80"
          >
            Sign in
          </Link>
          <a
            href="#demo"
            className="rounded-full bg-white text-[#FF8BA7] px-4 py-2 text-sm font-black shadow-lg transition-all hover-pop"
          >
            Book demo
          </a>
        </div>
      </div>
    </header>
  );
}
