import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors:{
        sky:"#ABE7FF",
        skyLight:"#D1F2FF",
        orange:"#FF882D",
        orangeLight:"#FFCDA7",
        yellow:"#FCE149",
        yellowLight:"#FCE877",
      }
    },
  },
  plugins: [],
};
export default config;
