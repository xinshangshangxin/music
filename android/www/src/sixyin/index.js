const { wrap } = require("./lx-wrap");
const originGetUrlPromise = wrap("./s2.js");

async function getUrl(id) {
  const fn = await originGetUrlPromise;
  return fn({
    provider: "tx",
    id,
  });
}

module.exports = getUrl;
