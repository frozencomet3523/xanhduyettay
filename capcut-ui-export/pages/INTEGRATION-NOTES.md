# capcut-landing-page.tsx

File gốc: `src/app/contact/[slug]/page.tsx`.

- Export default component tên `Page` — đổi tên hoặc re-export khi gắn vào App Router.
- `FormModal` load dynamic `ssr: false` (modal dùng `window`, `localStorage`, intl-tel-input).
- Các nút CTA gọi `openModal()` → `setModalOpen(true)`.
- Phụ thuộc `@/` paths như phần còn lại của gói export.
