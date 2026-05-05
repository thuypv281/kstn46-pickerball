# kstn46-pickerball

Trang giới thiệu giải đấu **Picker Ball — KSTN46**: hai đội **Team Hoài** và **Team Huyền**, chia hạng **Chủ lực** và **Phong trào**.

Stack: [Vite](https://vitejs.dev/) + React + TypeScript + [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`).

## Cài đặt và chạy

```bash
git clone https://github.com/thuypv281/kstn46-pickerball.git
cd kstn46-pickerball
npm install
npm run dev
```

- **Dev:** `npm run dev` — mở URL hiển thị trong terminal.
- **Build production:** `npm run build` — output trong thư mục `dist/`.
- **Xem bản build:** `npm run preview`.

## Chỉnh nội dung đội hình / giải

Sửa file [`src/data/roster.ts`](src/data/roster.ts):

- `tournamentMeta` — tiêu đề, phụ đề, ngày giờ, địa điểm (placeholder).
- `rosterSections` — các hạng và từng cặp `teamHoai` / `teamHuyen`; trường `note` tùy chọn (ví dụ ghi chú cho cặp Vũ–Lâm).

## Đẩy code lên GitHub

```bash
git push -u origin main
```
