const { back } = require("androidjs");

const config = require("./src/config");

back.on("port", () => {
  back.send(config.port);
});

const run = require("./src/index");
run();
