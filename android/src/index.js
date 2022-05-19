const http = require("http");
const { parse: urlParse } = require("url");
const { parse: qsParse } = require("querystring");

const download = require("./download");
const audioPipe = require("./audio-pipe");
const config = require("./config");

function run(port = config.port, host = "0.0.0.0") {
  http
    .createServer(async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type"
      );
      res.setHeader("Access-Control-Allow-Credentials", true);

      if (req.method === "OPTIONS") {
        res.end();
        return;
      }

      if (req.url === "/1.1/functions/_ops/metadatas") {
        res.statusCode = 404;
        res.end();
        return;
      }

      if (req.url === "/" || /__engine/.test(req.url)) {
        res.end();
        return;
      }

      let { id, provider, br } = qsParse(urlParse(req.url).query);
      let range = req.headers.range;
      console.info({ id, provider, br, range, url: req.url });

      if (!id || !provider) {
        res.statusCode = 400;
        res.end();
        return;
      }
      br = br || "mid";

      try {
        let realPath = await download({ id, provider, br });
        await audioPipe(res, realPath, range);
      } catch (e) {
        console.warn(e);
        res.statusCode = 400;
        res.end();
      }
    })
    .listen(port, host)
    .on("listening", () => {
      console.info("listening on ", port);
    });
}

module.exports = run;
