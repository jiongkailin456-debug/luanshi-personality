// Vercel 备用站保留 API 响应结构；自动支付和在线完整报告目前均未开放。
export const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});
