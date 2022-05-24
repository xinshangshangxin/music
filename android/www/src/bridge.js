let o = {};

try {
  o = require("bridge");
} catch (e) {
  o = {
    channel: {
      addListener: () => {},
      send: () => {},
    },
  };
}

module.exports = o;
