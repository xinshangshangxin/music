const http = require("http");
const finalhandler = require("finalhandler");
const serveStatic = require("serve-static");
const { resolve } = require("path");

const download = require("./download");
const audioPipe = require("./audio-pipe");
const config = require("./config");
const qm = require("./qq");

const serve = serveStatic(resolve(__dirname, "../static"));

async function run(port = config.port, host = "0.0.0.0") {
  return new Promise((resolve, reject) => {
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

        if (req.url === "/hello" || /__engine/.test(req.url)) {
          res.write("hello world");
          res.end();
          return;
        }

        const { searchParams, pathname } = new URL(
          req.url,
          req.headers.origin || "http://localhost"
        );

        console.log("==================", { pathname });

        // qq cookie 写入更新
        if (pathname === "/qq") {
          const cookie = searchParams.get("cookie");

          qm.updateCookie(cookie)
            .then(() => {
              res.statusCode = 200;
              res.end();
            })
            .catch((e) => {
              console.warn(e);
              res.statusCode = 400;
              res.end();
            });

          return;
        }

        // 静态资源返回
        if (pathname !== "/proxy") {
          serve(req, res, finalhandler(req, res));
          return;
        }

        // music url
        const id = searchParams.get("id");
        const provider = searchParams.get("provider");
        let br = searchParams.get("br");

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

        resolve(port);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

module.exports = run;
