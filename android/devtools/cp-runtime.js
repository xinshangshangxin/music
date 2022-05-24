const fs = require("fs-extra");
const { resolve } = require("path");

const distDir = resolve(__dirname, "../www/capacitor/");

const core = resolve(
  __dirname,
  "../node_modules/@capacitor/core/dist/capacitor.js"
);
const filesystem = resolve(
  __dirname,
  "../node_modules/@capacitor/filesystem/dist/plugin.js"
);

fs.emptyDirSync(distDir);
fs.ensureDirSync(distDir);

fs.copySync(core, resolve(distDir, "core.js"));
fs.copySync(filesystem, resolve(distDir, "filesystem.js"));

fs.copySync(resolve(__dirname, "./eruda.js"), resolve(distDir, "eruda.js"));
