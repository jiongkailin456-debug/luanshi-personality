# 乱世人格志

《乱世人格志｜如果你生在乱世，你会成为哪种人物？》是一款中文情境人格测试网页。回答 20 道四选一场景题后，可免费查看八维能力、人物原型、匹配度、基础自画像、三个关键词和免费分享卡。完整人格档案设有独立的服务端报告层。

本项目仅供娱乐与自我观察，不属于专业心理评估。历史人物八维值是本测试内部的叙事参数，匹配只表示原型类比。

## 文件结构

| 文件 | 内容 |
| --- | --- |
| `index.html` | 首页、答题页、结果页的结构与页面元信息 |
| `style.css` | 移动端优先的视觉样式、过渡动画与 3:4 分享卡 |
| `app.js` | 20 道题、八维模型、8 种人格、16 位人物、计分与交互 |
| `payment.js` | 统一价格、付款状态、购买恢复和开发测试开关 |
| `api/premium-report.js` | 验证付款后返回完整报告；未付款返回 403 |
| `api/payment-status.js` | 服务端查询购买状态 |
| `api/dev-payment.js` | 仅在非生产开发环境签发测试付款凭据 |
| `server/` | 服务端报告文案与付款签名验证，不能作为静态文件公开 |
| `dev-server.mjs` | 仅监听本机的无依赖开发服务 |
| `build.mjs`、`vercel.json` | 只把公开前端文件放入 `public/`，供 Vercel 和 EdgeOne 静态发布 |
| `deployment-check.html` | 部署后的网页、脚本和本地存储检查页 |
| `EDGEONE_DEPLOY.md` | EdgeOne Pages 的中文部署步骤和大陆域名说明 |
| `README.md` | 项目说明与修改方法 |

## 运行

双击 `index.html` 仍可运行**免费测试、免费结果及付费预览**。当前没有真实支付平台，点击“立即解锁”会显示“完整档案支付功能即将开放”，不会伪造付款成功。完整报告需要服务端验证，直接打开本地文件无法调用 `/api/`。

本地开发服务：安装 Node.js 后在项目目录运行 `npm run dev`，打开 `http://127.0.0.1:4173`。服务仅监听本机回环地址，默认仍显示正式的“支付尚未开放”状态。`npm run build` 会把 `index.html`、`style.css`、`app.js`、`payment.js`、`deployment-check.html` 复制到 `public/`；服务端报告源码不会进入该目录。

## EdgeOne Pages 静态部署

完整点击步骤见 [`EDGEONE_DEPLOY.md`](./EDGEONE_DEPLOY.md)。核心配置：GitHub 仓库 `luanshi-personality`，Root Directory 为 `乱世人格志-网页项目`，框架选 `Other / Static`，Build Command 为 `node build.mjs`，Install Command 留空，Output Directory 为 `public`。这里需要一个极轻量的 Node 构建步骤，是为了**只发布静态网页**，避免把 `server/` 的付费报告文案和 `api/` 的 Vercel 服务端代码公开；不需要安装任何第三方依赖。项目根目录的 `index.html` 仍可直接本地打开。EdgeOne 的 Premium 后端暂未迁移，免费测试和付费预览不依赖该后端。

## 测试算法

每道题的四个选项分别为 1～3 个维度加分。答完后，程序累加用户获得的分数，并按**当前题库中该维度的理论最低、平均、最高可得分**换算到 0～100。平均选择对应约 68 分，理论低端对应 26 分，高端对应 100 分。计算不含随机数，同一组答案始终得到同一结果。`app.js` 中的 `calculateResult()` 实现了这一步。

八维分别为：决断、共情、开创、洞察、表达、经营、独立、担当。每个维度的解释、优势与过度使用时的提醒位于 `DIMENSIONS` 数组。

八种人格原型位于 `ARCHETYPES` 数组。程序计算用户八维与每种原型参考向量的均方根距离，选择距离最近者。16 位历史人物位于 `FIGURES` 数组，也使用八维参考向量。人物匹配度由 `100 - 均方根距离 × 1.08` 得到，并限制在 0～100；这只是页面中的类比指标，不是统计学概率。完整版中的三位相近人物由服务端独立计算。

## Premium 功能

免费结果由 `app.js` 生成。`payment.js` 中的 `PREMIUM_PRICE = 3.9` 是页面与弹窗共用价格；修改它即可改变展示价格。完整报告文案只在 `server/premium-report-content.mjs`，由 `api/premium-report.js` 在服务端验证后返回。静态发布时**只发布 `public/` 中的前端文件**，不要把 `server/` 作为静态目录公开。

付款状态为 `unpaid`、`pending`、`paid`、`failed`。浏览器保存 `premiumPurchase`，包含版本、当前结果的 `resultId` 与 `resultHash`、订单 ID、解锁时间和服务端凭据。结果 ID 由八维分数、首位匹配人物和人格类型稳定生成。浏览器里的 `paid` 字段本身**不能解锁**：刷新或恢复购买时，必须再向服务端验证凭据并取得报告。新测试若得到不同结果，旧购买不会自动解锁它。

生产环境目前是 **Payment provider not configured**：`createOrder()` 返回 `payment_not_configured`，`POST /api/premium-report` 在没有有效服务端付款验证时返回 HTTP 403 与 `{ "error": "premium_required" }`。没有订单伪造、微信或支付宝成功假象。`/api/dev-payment` 在生产环境关闭；即便有人修改前端的 `DEV_MODE`，也无法让生产服务端放行。

### 开发测试模式

1. 把 `payment.js` 顶部的 `const DEV_MODE = false` 临时改为 `true`。
2. 运行 `npm run dev`，从 `http://127.0.0.1:4173` 打开网页。付款弹窗底部会出现“开发测试：模拟已付款”。本地服务会签发只对当前结果有效的短期测试凭据，服务端复核后才显示完整报告。
3. 测试完改回 `false`。生产发布必须保持 `false`，并且不要在生产环境设置 `PREMIUM_DEV_MODE=true`。本地开发服务重启后测试签名密钥会变化，旧测试购买需要重新模拟。

### 未来接入真实收款

在 `payment.js` 的 `createOrder()` 接入商户创建订单流程；在 `server/payment-security.mjs` 的 `verifyPayment()` 用服务端商户密钥核对真实订单的付款状态、金额、币种、`resultId` 与 `resultHash`。`api/payment-status.js` 与 `api/premium-report.js` 已经在调用服务端验证。恢复购买还需要商户订单查询或账号绑定机制；不能依赖浏览器 `localStorage` 作为付款证据。上线前应在 Vercel 设置相应环境变量并用真实沙箱订单完整测试。

## 修改内容

- **增加或修改问题：** 编辑 `app.js` 中的 `QUESTIONS`。每题需有 `category`、`title` 和四个 `options`。选项用 `O('文字', [[维度下标, 加分], ...])` 表示，维度下标按 `DIMENSIONS` 的顺序从 0 到 7。若增删题，首页的题量文案与分享卡文案也应同步修改。
- **增加历史人物：** 在 `FIGURES` 中添加 `name`、`era`、八项 `vector`、三个 `tags` 和 `note`。八项数值顺序与 `DIMENSIONS` 相同。
- **修改人格原型：** 编辑 `ARCHETYPES` 的参考向量和 `lead`、`strength`、`cost`、`risk`、`voice`。`voice` 是原创人格文案，请勿改成未经核实的历史人物引语。
- **修改免费文案：** `app.js` 的 `snapshot()` 与 `renderResult()` 负责免费自画像和版式；`renderShareCard()` 负责免费分享卡。
- **修改完整版文案：** `server/premium-report-content.mjs` 负责动态报告；不要把它的全文复制到前端文件。
- **修改配色：** 编辑 `style.css` 顶部 `:root` 的 `--paper`、`--ink`、`--red`、`--gold`、`--card`、`--muted` 等变量。

答题进度、答案与完成标记保存在当前浏览器的 `localStorage`。刷新可继续或查看结果；点击“重新测试”会清空旧答案并从第 1 题开始。
