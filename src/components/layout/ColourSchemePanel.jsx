import React, { useEffect } from "react";

function ColourSchemePanel({ colourScheme, width }) {
  const ref = React.useRef(null);
  const canvasRef = React.useRef(null);

  const draw = (ctx) => {
    let h = width / 3;
    ctx.clearRect(0, 0, width, h);
    let x = 0;
    let y = 0;
    let w = width / colourScheme.colours.length;
    colourScheme.colours.forEach((colour) => {
      ctx.fillStyle = colour;
      ctx.fillRect(x, y, w, h);
      x += w;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const ratio = window.devicePixelRatio;
    const height = 100;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.getContext("2d").scale(ratio, ratio);
    draw(context);
  }, []);

  return (
    <div ref={ref} className="cursor-pointer">
      <canvas id="canvas" ref={canvasRef} />
    </div>
  );
}

export default ColourSchemePanel;
