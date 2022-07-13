const { writeJSON, readJSON, ensureDir } = require("fs-extra");
const getDir = require("../save-dir");
const rp = require("request-promise");
const { resolve: pathResolve } = require("path");

function parseCookie(curlLine) {
  const cookie = curlLine
    .replace(/[\d\D]*'cookie:([^']*)'[\d\D]*/, "$1")
    .trim();

  const userCookie = {};
  cookie.split("; ").forEach((c) => {
    const arr = c.split("=");
    userCookie[arr[0]] = arr[1];
  });

  return {
    str: cookie,
    obj: userCookie,
  };
}

class QQMusic {
  constructor() {
    this.readCookie()
      .then(() => {
        console.log("读取 cookie 成功");
      })
      .catch((e) => {
        console.warn(e);
        console.warn("读取 cookie 失败");
      });
  }

  // public
  async url(id) {
    const { uin, qqmusic_key } = this.cookie.obj;

    const file = `M500${id}${id}.mp3`;
    const guid = (Math.random() * 10000000).toFixed(0);

    const options = {
      url: "https://u.y.qq.com/cgi-bin/musicu.fcg",
      json: true,
      qs: {
        "-": "getplaysongvkey",
        g_tk: 5381,
        loginUin: uin,
        hostUin: 0,
        format: "json",
        inCharset: "utf8",
        outCharset: "utf-8¬ice=0",
        platform: "yqq.json",
        needNewCode: 0,
        data: JSON.stringify({
          req_0: {
            module: "vkey.GetVkeyServer",
            method: "CgiGetVkey",
            param: {
              filename: [file],
              guid: guid,
              songmid: [id],
              songtype: [0],
              uin: uin,
              loginflag: 1,
              platform: "20",
            },
          },
          comm: {
            uin: uin,
            format: "json",
            ct: 19,
            cv: 0,
            authst: qqmusic_key,
          },
        }),
      },
    };

    const result = await rp(options);

    let purl = "";
    let domain = "";

    if (result.req_0 && result.req_0.data && result.req_0.data.midurlinfo) {
      purl = result.req_0.data.midurlinfo[0].purl;

      domain =
        result.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
        result.req_0.data.sip[0];
    }

    if (!domain || !purl) {
      console.log("==================", { domain, purl });
      throw new Error("no url found");
    }

    return `${domain}${purl}`;
  }

  // public
  async updateCookie(v) {
    if (typeof v === "string") {
      if (/curl/.test(v)) {
        return this.saveCurlCookie(v);
      }

      return this.saveCurlCookie(`'cookie: ${v}'`);
    } else if (typeof v === "object") {
      const newCookie = {
        ...this.cookie.obj,
        ...v,
      };

      return this.saveCookie({
        obj: newCookie,
        str: Object.keys(newCookie)
          .map((k) => {
            return `${k}=${newCookie[k]}`;
          })
          .join("; "),
      });
    }
  }

  async getCookiePath() {
    const saveDir = await getDir();

    const profileDir = pathResolve(saveDir, "profile");

    await ensureDir(profileDir);

    const profilePath = pathResolve(profileDir, "cookie.json");

    return profilePath;
  }

  async readCookie() {
    const profilePath = await this.getCookiePath();
    this.cookie = await readJSON(profilePath);
  }

  async writeCookie() {
    const profilePath = await this.getCookiePath();
    await writeJSON(profilePath, this.cookie);
  }

  async saveCurlCookie(curlLine) {
    const cookie = parseCookie(curlLine);

    this.saveCookie(cookie);
  }

  async saveCookie(cookie) {
    console.log("==========save cookie========", { cookie });
    this.cookie = cookie;

    return this.writeCookie();
  }
}

const qm = new QQMusic();

module.exports = qm;
