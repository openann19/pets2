/**
 * Local ESLint Rules Plugin
 * 
 * Exposes custom rules for PawfectMatch mobile development
 */

"use strict";

module.exports = {
  rules: {
    "no-hardcoded-colors": require("./no-hardcoded-colors.js"),
  },
};
