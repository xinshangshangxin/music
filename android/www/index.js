const { channel } = require("./src/bridge");

const run = require("./src/index");

let port;
run().then((p) => {
  port = p;
});

channel.addListener("GET_PORT", () => {
  console.log("============GET_PORT======");
  if (!port) {
    return;
  }

  channel.send("PORT", port);
});
