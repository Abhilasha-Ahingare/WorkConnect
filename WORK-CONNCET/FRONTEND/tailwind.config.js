module.exports = {
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 0.6s ease-in-out forwards",       // ← Added `forwards`
        slideInLeft: "slideInLeft 0.6s ease-in-out",
        slideInRight: "slideInRight 0.6s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-30px)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        slideInRight: {
          "0%": { transform: "translateX(30px)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
      },
    },
  },
};
