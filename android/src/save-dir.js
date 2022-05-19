const { back } = require("androidjs");
const { homedir } = require("os");
const { resolve: pathResolve } = require("path");

function defer() {
  let resolve;
  let reject;

  const p = new Promise((rs, rj) => {
    resolve = rs;
    reject = rj;
  });

  return {
    promise: p,
    resolve,
    reject,
  };
}

const deferred = defer();

back.on("userData", (dir) => {
  if (dir === "debug") {
    deferred.resolve(pathResolve(homedir(), ".music"));
  } else {
    deferred.resolve(dir);
  }
});

let getDir = async (timeout = 3000) => {
  return new Promise((rs, rj) => {
    let timer = setTimeout(() => {
      rj(new Error("Timeout"));
    }, timeout);

    deferred.promise
      .then((dir) => {
        rs(dir);

        clearTimeout(timer);
      })
      .catch(rj);
  });
};

module.exports = getDir;
