const { EventEmitter } = require("events");
const { resolve } = require("path");

let o = {};

try {
  o = require("bridge");
} catch (e) {
  const ee = new EventEmitter();

  ee.send = ee.emit.bind(ee);

  o = {
    channel: ee,
  };

  setTimeout(() => {
    o.channel.send("userData", resolve(__dirname, "../.tmp"));
  }, 1000);
}

module.exports = o;
