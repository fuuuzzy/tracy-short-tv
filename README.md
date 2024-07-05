# tracy-short-tv
一个基于开源项目 GoFilm 前端页面整改的短视频网站,目前只有前端，数据是通过现有的api请求获取，比较适合需要搭建短视频网站但需要的前端页面的人

**项目演视地址**
https://video.fuuuzzy.cn

## 简介
项目采用vite + vue作为前端技术栈, 使用 ElementPlus 作为UI 框架进行开发

**网站功能**

- 比较简易，适合短视频，目前只有首页和播放页
- 历史观看
- 默认访问地址: `服务器IP:默认端口 [http://127.0.0.1:3600]`

## 启动方式
-  在项目root目录执行 `pnpm i` 或者 `npm i`
-  在执行 `pnpm run serve` 或者 `npm run serve`
-  控制台会打印具体ip地址

## 部署
-  项目提供了一个shell脚本(`update-dev.sh`)，修改里面的远程服务器名称和具体保存路径，即可上传到服务器，使用nginx或者caddy等代理服务器即可部署
