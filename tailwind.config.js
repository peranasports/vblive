/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter_black: [`inter_black`],
        inter_black_italic: [`inter_black_italic`],
        inter_bold: [`inter_bold`],
        inter_bold_italic: [`inter_bold_italic`],
        inter_extrabold: [`inter_extrabold`],
        inter_extrabold_italic: [`inter_extrabold_italic`],
        inter_extralight: [`inter_extralight`],
        inter_extralight_italic: [`inter_extralight_italic`],
        inter_italic: [`inter_italic`],
        inter_light: [`inter_light`],
        inter_light_italic: [`inter_light_italic`],
        inter_medium: [`inter_medium`],
        inter_medium_italic: [`inter_medium_italic`],
        inter_regular: [`inter_regular`],
        inter_semibold: [`inter_semibold`],
        inter_semibold_italic: [`inter_semibold_italic`],
        inter_thin: [`inter_thin`],
        inter_thin_italic: [`inter_thin_italic`],
      },
    },
  },
  plugins: [require("daisyui")],
}
