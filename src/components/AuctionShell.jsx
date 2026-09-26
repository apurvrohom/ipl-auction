/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import GodRaysBg from "./GodRaysBg";

const THEMES = ["broadcast", "ice"];
const THEME_LABEL = { broadcast: "Broadcast", ice: "❄ Ice" };

// Shared classic-auction template: video backdrop, heading,
// and the 3-column layout (left / center / right).
// Used by `/` (classic), `/live` (audience) and `/control` (dashboard)
// so all screens share one look.
export default function AuctionShell({
  title = "IPL MOCK AUCTION",
  left,
  center,
  right,
  topRight,
}) {
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem("ipl-theme") || "broadcast",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("ipl-theme", theme);
  }, [theme]);
  const cycleTheme = () =>
    setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]);
  return (
    <div className="min-h-screen bc-shell-bg text-white overflow-x-clip ">
      <GodRaysBg />
      {/* Backdrop pattern: above the bg, below all content, centered on the title */}
      <img
        src="pattern.svg"
        alt=""
        aria-hidden="true"
        className="bc-spin-slow absolute left-1/2 top-24 z-[1] w-[50vw] opacity-30 pointer-events-none"
      />
      {/* Top-left corner: E-Cell mark plus the sponsor logo. Sized to stay
          clear of the centered title rather than matching its h-48 — at
          that size the two collide on anything narrower than ~2000px. */}
      <div className="absolute z-40 top-10 left-10 flex items-center gap-4">
        <img
          src="https://ecell.nitk.ac.in/navLogo.png"
          alt=""
          className="w-34 h-auto"
        />
        <img src="/logo.svg" alt="Sponsor" className="h-32" />
      </div>
      {topRight && (
        <div className="absolute z-40 bottom-4 left-4 flex gap-2">
          <button
            onClick={cycleTheme}
            className="bg-white/10 text-white text-xs px-3 py-1.5 rounded hover:bg-white/20"
            title="Switch theme"
          >
            {THEME_LABEL[theme] ?? theme}
          </button>
          {topRight}
        </div>
      )}
      <div className="relative z-10 min-h-screen flex flex-col">
        <h1
          className="text-center text-5xl  relative z-10 heading-font"
          // style={{ textShadow: "4px 4px 0px #4f829c" }}
        >
          {/* {title} */}
          <div className="w-full top-0 absolute">
            <img src="title.svg" className="h-48 mx-auto relative" />
          </div>
        </h1>
        <div className="relative flex justify-center items-start px-0 overflow-visible flex-1">
          <div className="flex-1 self-stretch flex flex-col overflow-visible ">
            {left}
          </div>
          <div className="relative flex-1 mt-20">{center}</div>
          <div className="flex-1 self-stretch flex flex-col overflow-visible ">
            {right}
          </div>
        </div>
      </div>
    </div>
  );
}
