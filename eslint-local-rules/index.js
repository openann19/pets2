"use strict";

module.exports = {
  rules: {
    "no-hardcoded-colors": (function(){try{return require("./rules/no-hardcoded-colors.js");}catch(_){return require("./no-hardcoded-colors.js");}})(),
    "no-legacy-theme": (function(){try{return require("./rules/no-legacy-theme.js");}catch(_){return require("./no-legacy-theme.js");}})(),
  },
};
