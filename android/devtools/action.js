const noop = () => {};

process.stdout.clearLine = noop;
process.stdout.cursorTo = noop;

require("androidjs-builder/bin.js");
