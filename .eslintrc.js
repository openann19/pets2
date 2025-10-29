"use strict";

module.exports = {
  // ...existing config...
  plugins: ["local"],

  overrides: [
    {
      files: ["apps/mobile/src/**/*.{ts,tsx,js,jsx}"],
      excludedFiles: [
        "**/theme/**/*.{ts,tsx}",
        "**/constants/**/*.{ts,tsx}",
        "**/styles/**/*.{ts,tsx}",
        "**/types/**/*.{ts,tsx}",
      ],
      rules: {
        "local/no-hardcoded-colors": "error",
      },
    },
  ],
};
