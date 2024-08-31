import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

function ThemePicker( { onThemeChange } ) {
  const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "garden");

  const doTheme = (th) => {
    document.querySelector("html").setAttribute("data-theme", th);
    setTheme(th);
    // toast.success("Please refresh page to activate new colour themes.");
    onThemeChange(th);
  };

  useEffect(() => {});

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.querySelector("html").setAttribute("data-theme", theme);
  }, [theme]);

  const themes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    // "dim",
    // "nord",
    // "sunset",
  ];

  return (
    <>
      <html data-theme={theme}>
        <div className="flex flex-col overflow-auto">
          <p className="p-2 text-lg font-bold">Current theme: {theme}</p>
          <div className="flex overflow-auto">
            <div className="grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 h-[70vh]">
              {themes.map((th, i) => (
                <div className="col-span-1 p-4" key={i} id={th}>
                  <img
                    className="cursor-pointer rounded-xl border-4 hover:border-red-500"
                    src={require(`../assets/themes/${th}.png`)}
                    width={294}
                    height={204}
                    alt={th}
                    onClick={() => doTheme(th)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </html>
    </>
  );
}

export default ThemePicker;
