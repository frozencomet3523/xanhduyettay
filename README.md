# Deploy

App Next.js trên **Netlify**, trang iframe trên **Vercel**, socket trên **VPS**.

## Env lúc build

Sửa **2 dòng** trong `netlify.toml` rồi push:

```toml
[build.environment]
  FRAME_ANCESTORS = "'self' https://tomioka.vercel.app"
  VPS_BACKEND_URL = "http://167-104-101-54.nip.io:3001"
```

- Origin Vercel: không dấu `/` cuối, không path. Domain mua gắn Vercel là origin khác — phải thêm/đổi dòng `FRAME_ANCESTORS`, không tự nhận.
- Backend: dùng hostname (`*.nip.io`), không IP trần.
- `NEXT_PUBLIC_VPS_URL` để trống — client nối same-origin, Netlify rewrite sang VPS.

Netlify UI nếu đã ghi Build command / plugin thì trùng với file; env cùng tên trên UI thắng `netlify.toml`.

Local: copy `.env.example` → `.env`.

Trang Vercel: sửa `EMBED_ORIGIN` trong `index.source.html`, chạy `pnpm encode-html`, deploy `index.html`.
