# Hướng dẫn Deploy MacNotes (Next.js 16 + MongoDB)

Dự án đã được chuyển đổi sang Next.js 16 và sử dụng MongoDB.

## Cấu hình Môi trường (Environment Variables)

Bạn cần tạo file `.env.local` ở local hoặc cấu hình Environment Variables trên Vercel với nội dung:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/macnotes?retryWrites=true&w=majority
```

> **Lưu ý**: Thay thế `<username>`, `<password>` và `<cluster>` bằng thông tin MongoDB Atlas của bạn.

## Chạy Local

1. Tạo file `.env.local` và điền `MONGODB_URI`.
2. Chạy lệnh:
   ```bash
   npm run dev
   ```

## Deploy lên Vercel

1. Push code lên GitHub.
2. Trên Vercel Dashboard, import dự án.
3. Trong phần **Environment Variables**, thêm `MONGODB_URI`.
4. Bấm **Deploy**.

## PWA
Ứng dụng hỗ trợ Progressive Web App (PWA). Bạn có thể cài đặt nó như một ứng dụng native trên điện thoại hoặc máy tính. App icon (`/public/logo.png`) đã được tích hợp.
