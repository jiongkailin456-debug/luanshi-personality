# EdgeOne Pages 部署与一单一码上线

## 1. 发布网站与函数

将公开项目文件上传到 GitHub 仓库中 EdgeOne 配置的项目根目录。**不要上传 `local-tools/`、卡密 CSV、API Token、`.env`、`work/`、`outputs/` 或 `node_modules/`。** 如果通过 GitHub 网页手动上传，请自己确认没有把这些文件拖入仓库；`.gitignore` 只保护 Git 命令提交。

EdgeOne Makers 项目的构建配置：

| 项目 | 设置 |
| --- | --- |
| Root Directory | 公开项目在仓库中的目录，例如 `乱世人格志-网页项目` |
| Install Command | `npm ci` |
| Build Command | `node build.mjs` |
| Output Directory | `public` |
| Node.js | 20 或更新版本 |

`public/` 只放 7 个公开静态文件。项目根目录的 `cloud-functions/api/verify-access-code.js`、`check-access.js` 和 `save-result.js` 会被 EdgeOne 识别为同域 Function 路由；**不要只上传 `public/` 文件夹**，否则卡密验证会失败。EdgeOne [Node Functions 路由说明](https://pages.edgeone.ai/document/node-functions) 和 [Blob SDK 文档](https://pages.edgeone.ai/document/blob-storage)描述了目录路由与存储用法。

这次增加了 `@edgeone/pages-blob` 依赖和 `package-lock.json`。请在 GitHub 保留 `package-lock.json`，让 `npm ci` 使用固定版本。旧 Vercel `api/` 接口不是本功能的实现；若另行部署 Vercel，需要单独适配后端。

## 2. 初始化卡密库存

卡密状态使用 EdgeOne Makers Blob 命名空间 `luanshi-access-v1`，不是静态 JSON。Blob SDK 在项目函数中使用平台凭据，在本机管理脚本中使用你自己的项目 ID 和 API Token；**这些凭据不在公开代码中**。普通 Makers KV 有跨节点最终一致延迟，不适合严格一次性抢占，因此使用 Blob 的强一致读取与条件写入。[KV 一致性说明](https://pages.edgeone.ai/document/kv-storage)

1. 在 EdgeOne 控制台确认项目已具备 Cloud Functions 与 Blob 功能，部署公开项目。
2. 在 Makers 控制台创建有期限的 API Token，复制项目 ID，只在自己的电脑上使用。
3. 解压单独交付的 `local-tools` 文件夹，在本地打开 `code-generator.html` 生成 100 个码并导出 CSV。
4. 按单独交付的本地工具包 `README.md` 中的命令运行 `code-manager.mjs import`。看到“导入完成”后，才把 CSV 的码放进小红书自动发货库存。
5. 自动发货文字填写**正式网站地址 + 此订单专属 6 位码**。一次订单只能发一个未分配的码。

卡密数据按 `codes/`、`claims/`、`disabled/`、`results/` 路径存储；一次激活只创建一个不可覆盖的 `claims/<code>.json`。`code-manager.mjs status 583271` 可查状态，`disable 583271` 可永久禁用。生产站没有后台管理网页或公开批量导入接口。

## 3. 上线验收

部署后先访问 `/deployment-check.html`，应看到 `app.js` 加载正常，以及“访问验证接口与存储：接口与存储正常”。然后用**自己准备且已导入的一条测试卡密**检查：首次打开显示验证页；输入后进入第 1 题；刷新无需重新输入；另一个浏览器输入同一码被拒绝；做完 20 题可看结果和结果码；重新测试仍使用同一 `accessId`。

卡密只有 6 位数字。代码已加入按 IP 每 15 分钟 8 次的服务端尝试限制；建议在 EdgeOne 控制台另设针对 `/api/verify-access-code` 的 WAF / 频率限制，以抵御分布式猜码。若函数或存储暂不可用，入口会保持关闭并提示重试，不会让用户绕过服务端验证。

## 4. 正式访问域名

EdgeOne 分配的中国大陆临时预览链接不适合长期放在自动发货信息里。按 [域名管理](https://pages.edgeone.ai/document/domain-overview) 和 [自定义域名](https://pages.edgeone.ai/document/custom-domain)说明准备长期使用的正式域名；若选择中国大陆加速区域，按平台要求完成 ICP 备案。上线前用手机在实际网络中验证域名、HTTPS、Function 和卡密流程。
