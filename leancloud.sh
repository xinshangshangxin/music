#!/usr/bin/env bash
set -e

rm -rf dist && tsc
cat package.json | jq ".scripts={} | .scripts.start=\"./node_modules/.bin/pm2-docker start main.js --raw\" | .devDependencies={} | .dependencies.pm2=\"^3.0.4\" | .engines.node=\">=10\"" > dist/package.json

mkdir ./dist/.leancloud
echo "Kl36DXkU9eS9szLt2lMNkalY-gzGzoHsz" > ./dist/.leancloud/current_app_id
echo "web" > ./dist/.leancloud/current_group
cp src/graphqls/*.graphql dist/graphqls/

cd dist
lean deploy
cd ..