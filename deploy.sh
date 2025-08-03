#!/usr/bin/env sh

# 發生錯誤時終止腳本
set -e

# 建置專案
npm run build

# 進入建置後的資料夾
cd dist

# 因為 dist 資料夾預設會被 .gitignore 忽略，所以需要強制提交
git init
git add -A
git commit -m 'deploy'

# 將 dist 資料夾的內容推送到 gh-pages 分支
# 並強制無條件將舊有的 gh-pages 分支替換成目前的內容
git push -f git@github.com:raellen/vue-backend.git main:gh-pages

cd -