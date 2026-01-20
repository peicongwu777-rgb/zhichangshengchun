import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#222222", // 基础背景色
        foreground: "#f0f0f0", // 基础文字色
        primary: "#00ff00",    // 终端绿 - 强调/按钮
        secondary: "#00ccff",  // 霓虹蓝 - 数值/链接
        border: "#444444",     // 边框颜色
        muted: "#888888",      // 弱化信息
        surface: "#333333",    // 卡片/输入框背景
      },
      fontFamily: {
        // 强制全站使用等宽字体
        sans: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      borderRadius: {
        // 整体偏方正
        none: "0",
        sm: "0.125rem", // 2px
        DEFAULT: "0.25rem", // 4px
        md: "0.375rem", // 6px
        lg: "0.5rem", // 8px
        full: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
