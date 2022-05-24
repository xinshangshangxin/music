const fs = require("fs-extra");
const { resolve } = require("path");

// const devtools = `
// <script src="capacitor/eruda.js"></script>
// <script>
//   eruda.init();
// </script>
// `;

// const devtools = `
// <script src="https://unpkg.com/vconsole@latest/dist/vconsole.min.js"></script>
// <script>
// var vConsole = new window.VConsole();
// </script>
// `;

const appDir = `
<script type="text/javascript" src="capacitor/core.js"></script>
<script type="text/javascript" src="capacitor/filesystem.js"></script>
<script>
  const { Capacitor, CapacitorCustomPlatform } = capacitorExports;
  const { Directory, Filesystem } = capacitorFilesystem;

  const NodeJS = Capacitor.Plugins.NodeJS;

  async function getSaveDir() {
    const { uri } = await Filesystem.getUri({
      path: "",
      directory: Directory.External,
    });

    return uri.replace("file://", "");
  }

  function notifyDir() {
    let timer;

    NodeJS.addListener("ok", (event) => {
      console.log("========dir===OK=======");
      clearTimeout(timer);
    });

    getSaveDir()
      .then((dir) => {
        NodeJS.send({
          eventName: "userData",
          args: [dir],
        });

        timer = setInterval(() => {
          NodeJS.send({
            eventName: "userData",
            args: [dir],
          });
        }, 2000);
      })
      .catch((e) => {
        NodeJS.send({
          eventName: "userData",
          args: ["error", e.message],
        });
      });
  }

  notifyDir();
</script>
`;

const media = `
<script>
  const { registerPlugin } = capacitorExports;

  const mediaSessionManager = registerPlugin("MediaSessionManager");

  window.MediaMetadata = class MediaMetadata {
    constructor(info) {
      this.info;
    }
  };

  const mapping = {};
  navigator.mediaSession = new Proxy(
    {
      setActionHandler: (name, fn) => {
        mapping[name] = fn;
      },
      playbackState: new Proxy(
        {},
        {
          set: (obj, prop, value) => {
            mediaSessionManager.playPause({ state: value });

            return Reflect.set(obj, prop, value);
          },
        }
      ),
    },
    {
      set: (obj, prop, value) => {
        if (prop === "metadata") {
          mediaSessionManager.updateSongMeta(value);
        }

        return Reflect.set(obj, prop, value);
      },
    }
  );

  let when = 0;
  let times = 0;
  let timer = null;

  mediaSessionManager.addListener("action", ({ name }) => {
    console.log("==================", { name });
    // 耳机按钮按下
    if (name === "HEADSET_ACTION_DOWN") {
      clearTimeout(timer);
      const now = Date.now();
      if (now - when > 500) {
        when = now;
        times = 0;
      }

      times += 1;

      timer = setTimeout(() => {
        const togglePlay = mapping["togglePlay"] || (() => {});
        const nexttrack = mapping["nexttrack"] || (() => {});
        const previoustrack = mapping["previoustrack"] || (() => {});

        switch (times) {
          case 1:
            togglePlay();
            break;
          case 2:
            nexttrack();
            break;
          case 3:
            previoustrack();
            break;
          default:
            break;
        }
      }, 500);

      return;
    }

    if (mapping[name]) {
      mapping[name]();
    }
  });
</script>
`

const dist = resolve(__dirname, "../www/static/");

const list = fs.readdirSync(dist);

list.forEach((name) => {
  // plugin, must need
  if (name === "nodejs" || name === "capacitor") {
    return;
  }

  // live reload required
  if (name === "index.html") {
    return;
  }

  // clean others
  fs.removeSync(resolve(dist, name));
});

fs.copySync(resolve(__dirname, "../../frontend/dist/"), dist);

const indexHtmlPath = resolve(dist, "index.html");
const outputIndexHtmlPath = resolve(dist, "../index.html");

const content = fs.readFileSync(indexHtmlPath, "utf8");

fs.writeFileSync(
  outputIndexHtmlPath,
  content.replace(
    "<body>",
    `
<body>

${appDir}
${media}

`
  )
);
