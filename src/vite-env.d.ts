/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * URL gốc của API (không có / cuối), ví dụ https://your-api.onrender.com
   * Để trống: dùng cùng origin (dev qua proxy `/api`, hoặc deploy API + static chung một host).
   */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
