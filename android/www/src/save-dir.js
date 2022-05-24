const { channel } = require("./bridge");

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

channel.addListener("userData", (dir, msg) => {
  console.log("=====channel====userData=========", dir);

  channel.send("ok", dir);

  if (dir === "error") {
    throw new Error(msg);
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
