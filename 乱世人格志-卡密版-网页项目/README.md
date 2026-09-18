# 乱世人格志

20 道中文情境题、八维评分、历史人物 TOP3 匹配、免费结果、`LS1-` 结果码和本地 PDF 报告生成器保留。现在网站入口增加**一单一码访问验证**：购买者从小红书自动发货信息取得 6 位码，首次在网站激活后本浏览器保存访问令牌；刷新页面会向服务器复核令牌。

## 文件边界

| 位置 | 用途 |
| --- | --- |
| `index.html`、`style.css`、`access.js`、`app.js` | 卡密入口、20 题、结果页；不含有效卡密库存 |
| `result-code.js`、`payment.js` | 结果码校验、完整报告展示价格 |
| `cloud-functions/api/` | EdgeOne Node Cloud Functions：激活、复核令牌、绑定测试结果 |
| `public/` | EdgeOne 静态输出，仅 7 个公开网页文件 |
| `local-tools/` | 本机卡密生成、批量导入、查状态、禁用及 PDF 报告；绝不能公开上传 |
| `api/`、`server/` | 旧 Vercel 备用接口，付费接口已停用；新访问功能依赖 EdgeOne Functions |

卡密及激活状态在 EdgeOne Makers Blob 命名空间 `luanshi-access-v1` 中；浏览器只保存自己的 `accessToken`、`accessId`，以及原有的本机答题进度和结果。完整报告文案只在 `local-tools/report-content.js`。**不要把 `local-tools/`、CSV、API Token、`.env` 上传 GitHub 或网站。**

## 为什么用 Blob 而不是普通 KV

EdgeOne Makers KV 是最终一致存储，跨节点旧值最多可能保留约 60 秒。若两个买家同时输入同一码，“先读取 unused，再写 activated”可能让两人都通过。Blob 支持强一致读取及 `onlyIfNew` 条件写入；项目以 `codes/`、`claims/`、`disabled/`、`results/` 键组织卡密资料，并用不可覆盖的 `claims/<code>.json` 抢占一次激活。

六位数字只有一百万种组合，因此验证接口还有按客户端 IP 的每 15 分钟 8 次尝试限制。正式上线建议在 EdgeOne 控制台进一步配置 `/api/verify-access-code` 的 WAF / 频率限制，以抵御分布式猜码。结果码 checksum 仅检查复制损坏，不能充当付款凭据。

## 本地开发与上线

```powershell
npm ci
npm run dev
npm run build
```

本地开发服务会在终端打印**临时测试卡密**，只存在内存中，服务重启即消失。双击根目录 `index.html` 无法完成服务器验证，须通过本地服务或 EdgeOne 网站打开。

EdgeOne 需以项目根目录部署，安装命令 `npm ci`，构建命令 `node build.mjs`，静态输出目录 `public`。`cloud-functions/api/*.js` 由 EdgeOne 从**项目根目录**识别为同域 `/api/...` 路由，不要只上传 `public/`。部署完成后访问 `/deployment-check.html` 核对静态资源、验证接口与存储。详细步骤见 `EDGEONE_DEPLOY.md`。

本地工具的使用步骤见**单独交付的本地工具包**内的 `README.md`。先生成并批量导入卡密、确认导入成功，再把同一批码放入小红书自动发货库存。工具中的 `code-manager.mjs` 通过本机的 EdgeOne 项目 ID 和 API Token 直连 Blob；公开网站没有生成、查看全部卡密或重置卡密的管理入口。

## 结果与完整报告

激活后浏览器自动进入第 1 题；中途刷新可从原进度继续。完成测试时，服务端将结果的 `resultId`、人格类型、前三位历史人物和八维分数关联到 `accessId`。同一资格第一次结果记为不可覆盖的主结果；重新测试产生新修订结果，仍属于同一 `accessId`。结果页的 `LS1-` 结果码仍可发送给卖家，在本机 `report-generator.html` 生成 12 章 A4 PDF。

卡密只控制测试访问。完整 PDF 是否包含在同一商品里，以你的小红书商品说明为准；目前网页不会自动收款或交付 PDF。本测试仅供娱乐与自我观察，不属于心理诊断、职业诊断或历史人物的真实心理测量。
