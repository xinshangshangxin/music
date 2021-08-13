const http = require("http");
const { parse: urlParse } = require("url");
const { parse: qsParse } = require("querystring");
const rp = require("request-promise");
const config = require("./config");

const port = process.env.LEANCLOUD_APP_PORT || 3000;

async function getUrl(id, provider, br) {
  console.info("==== start getUrl");
  let options = {
    method: "POST",
    url: config.songUrl,
    body: {
      query: `
        query url($id:String!, $provider: Provider!, $br: BitRate) {
          url(id: $id, provider: $provider, br: $br)
        }
        `,
      variables: { id, provider, br },
    },
    json: true,
  };

  let {
    data: { url },
  } = await rp(options);

  return url;
}

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

    // 获取最新url
    let url = await getUrl(id, provider, br);

    console.log("==================", url);

    if (!url) {
      res.statusCode = 400;
      res.end();
      return;
    }

    res.writeHead(301, { Location: url });
    res.end();
  })
  .listen(port)
  .on("listening", () => {
    console.info("listening on ", port);
  });
