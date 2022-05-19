const fs = require("fs-extra");
const { resolve } = require("path");

const eruda = `
<script src="../assets/eruda.js"></script>
<script>
  eruda.init();
</script>
`;

const appDir = `
<script type="text/javascript" src="../assets/androidjs.js"></script>
<script>
  front.send(
    "userData",
    window.android ? app.getPath("userData") : "debug"
  );

  front.on("userData", (v) => {
    alert(v);
  });
</script>
`;

const dist = resolve(__dirname, "../views/");

fs.emptyDirSync(dist);
fs.copySync(resolve(__dirname, "../../frontend/dist/"), dist);

const indexHtmlPath = resolve(dist, "index.html");

const content = fs.readFileSync(indexHtmlPath, "utf8");

fs.writeFileSync(
  indexHtmlPath,
  content.replace(
    "<body>",
    `
<body>

${eruda}

${appDir}

`
  )
);
