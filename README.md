# Deploy

Ba phần: Cloudflare Worker (app Next.js), Vercel (trang iframe), backend (Socket.IO).

## 1. Up code lên Cloudflare Worker để lấy domain

Deploy repo này lên Cloudflare Workers (chưa cần env đúng).

Xong thì copy domain Worker, dạng:

`https://<ten>.<account>.workers.dev`

Domain này dùng cho iframe bên Vercel (`.../live`).

## 2. Có sẵn domain Vercel và backend trước khi điền env

Env trên Worker chỉ điền khi cả hai thứ này đã có:

- **Backend đã up code và đang chạy.** Lấy URL backend (hostname, không dùng IP trần — IP trần bị Cloudflare lỗi 1003 trên `/socket.io`). Ví dụ: `http://138-226-236-185.nip.io:3001`
- **Vercel đã có domain.** Trang HTML iframe trỏ tới domain Worker ở bước 1 (`index.source.html` → `src` = `https://<domain-worker>/live`, rồi deploy lên Vercel). Copy origin, không có dấu `/` cuối, không có path. Ví dụ: `https://osaka-nu-orpin.vercel.app`

## 3. Điền env trên Cloudflare Worker rồi deploy lại

Cloudflare → Worker → **Build → Variables**:

```
VPS_BACKEND_URL=http://<host-backend>:3001
FRAME_ANCESTORS='self' https://<domain-vercel>
```

`NEXT_PUBLIC_VPS_URL` để trống trên production (client đi cùng origin, Worker rewrite sang backend).

Hai biến trên được đọc lúc build. Sau khi điền phải deploy lại Worker.
