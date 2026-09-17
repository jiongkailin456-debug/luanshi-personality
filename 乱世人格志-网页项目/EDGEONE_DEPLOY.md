# EdgeOne Pages 部署说明（给第一次部署的你）

本项目仍可部署在 Vercel。EdgeOne Pages 先部署**免费测试的静态网页**；完整人格档案的 Vercel API 尚未迁移到 EdgeOne，真实支付也还没有接入。EdgeOne 上点击“立即解锁”只会看到“完整档案支付功能即将开放”，不会扣费或假装解锁。

## 先核对 GitHub 文件

打开 GitHub 仓库 `luanshi-personality`，确认仓库里有 `乱世人格志-网页项目` 文件夹，而且这次更新的 `index.html`、`payment.js`、`build.mjs`、`deployment-check.html` 和 `public/` 等文件已放在其中。EdgeOne 从 **GitHub 上的版本**部署；只修改电脑上的文件不会触发网站更新。

如果你尚未把这次修改上传到 GitHub，可以在仓库网页进入 `乱世人格志-网页项目`，使用 **Add file → Upload files** 上传更新后的文件，再点 **Commit changes**。上传文件夹的操作因浏览器而异；请在提交前检查 GitHub 里的目录层级，避免多套一层同名文件夹。切勿上传 `.env`、密钥、Token、`work/` 或 `outputs/`。

## 在腾讯云网页上创建项目

1. 打开 [腾讯云 EdgeOne Pages / Makers](https://pages.edgeone.ai/)，登录腾讯云账号，进入控制台。第一次使用时按页面提示开通。
2. 选择 **创建项目 / Import Git Repository**，点击 **GitHub** 并按提示授权。授权时选仓库 `luanshi-personality`。
3. 选择仓库 `luanshi-personality` 和需要自动部署的分支（通常是 `main`）。
4. 在构建配置里填写：

   | 项目 | 填写内容 |
   | --- | --- |
   | Root Directory / 根目录 | `乱世人格志-网页项目` |
   | Framework Preset / 框架 | `Other`、`Static` 或 `None`（以控制台实际选项为准） |
   | Build Command / 构建命令 | `node build.mjs` |
   | Install Command / 安装命令 | 留空；本项目没有第三方 npm 依赖 |
   | Output Directory / 输出目录 | `public` |

   **不要把输出目录填成 `.` 或项目根目录。**完整报告文案和 Vercel API 源码在 `server/`、`api/`，不能当作静态网页公开。`node build.mjs` 只复制五个公开文件到 `public/`，不需要 `npm install` 或大型框架。若控制台自动填入 `npm run build`，改成上表的 `node build.mjs`；若自动填入安装命令，能清空就清空。`package.json` 没有依赖，即使平台自行执行一次 `npm install`，也不会下载本项目的第三方包。

5. 选择加速区域，检查配置后点击 **开始部署 / Deploy**。等待状态变成部署成功。
6. 在项目概览或部署记录里复制**项目域名**，打开该网址的 `/`，应直接出现测试首页。再打开该网址的 `/deployment-check.html`，应看到 `Deployment OK`、`app.js 加载正常`、`localStorage 可用` 和当前 hostname。
7. 用手机关闭 VPN 和代理，切到常用的中国大陆移动网络，打开公开网址，测试首页、20 题、结果页、刷新、返回和付费提示。也可以让另一位使用不同运营商网络的人试一次。若不能打开，先区分是域名访问限制、部署失败，还是页面资源加载失败。

题目、结果和首页始终使用同一个网页地址；浏览器历史记录只保存页面内部状态，因此无需配置单页应用的 404 重写规则。

## 中国大陆长期访问的关键步骤

根据 EdgeOne 的[域名管理说明](https://pages.edgeone.ai/document/domain-overview)，平台分配的项目域名在中国大陆网络使用**系统生成的临时预览链接**，链接有效期为 **3 小时**；它不适合作为长期分享给小红书用户的正式入口。要获得长期稳定的中国大陆入口，请准备自己的域名，完成 ICP 备案，然后在 EdgeOne 项目的 **域名管理 → 添加自定义域名** 里绑定它，并选择包含中国大陆的加速区域。未备案域名只能选不含中国大陆的区域；这可能仍能从大陆访问，但不能保证达到大陆节点加速的目标。[自定义域名说明](https://pages.edgeone.ai/document/custom-domain)

域名、备案和加速区域属于腾讯云账号设置，代码无法替你完成。部署成功后，请以手机实际网络测试访问效果，不要只根据电脑或 VPN 下的结果判断。

## 自动更新与 Vercel 备用站

EdgeOne 的 [GitHub 导入说明](https://pages.edgeone.ai/document/importing-a-git-repository)指出：关联仓库后，向部署分支推送新提交会自动触发部署。以后修改项目根目录的源码，提交到 GitHub 后，EdgeOne 会执行 `node build.mjs` 并发布新的 `public/`；Vercel 仍按原有 `vercel.json` 构建，两边互不需要删除配置。

当前 `api/` 是 Vercel Functions 的写法，**Premium 后端暂未迁移**。EdgeOne 虽然提供[函数功能](https://pages.edgeone.ai/document/pages-functions-overview)，但部署静态网页时不应把现有 `api/` 当作已可运行的 EdgeOne 函数。未来有真实支付平台和服务端验单后，再迁移付费 API；切勿仅靠前端 `paid` 标记解锁报告。

## 如果部署后出现问题

- 根域名 404：确认 Root Directory 是 `乱世人格志-网页项目`，Output Directory 是 `public`，部署日志显示构建成功，并且 `public/index.html` 存在。
- `/deployment-check.html` 能打开，但 `app.js` 加载失败：检查 `public/app.js` 是否在该次部署中；重新部署。
- 页面显示“页面加载出现问题，请刷新后重试”：检查 `payment.js`、`app.js` 是否都正常返回，刷新后再试。
- 付费接口返回 404：这是当前 EdgeOne 静态版本的预期状态，免费测试不受影响；真实支付功能尚未开放。
- 中国大陆普通网址打不开：先查看上面的**临时预览链接 / 自定义域名 / ICP 备案**说明，再用非 VPN 手机网络复测。
