# Hướng dẫn Deploy MacNotes lên Vercel

Dự án này đã được cấu hình sẵn để deploy lên Vercel.

## Các bước thực hiện:

1. **Đẩy code lên GitHub (hoặc GitLab/Bitbucket)**
   - Tạo một repository mới.
   - Run các lệnh sau trong terminal:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin <URL-REPO-CUA-BAN>
     git push -u origin main
     ```

2. **Deploy trên Vercel**
   - Truy cập [Vercel Dashboard](https://vercel.com/dashboard).
   - Bấm nút **"Add New..."** -> **"Project"**.
   - Chọn repository bạn vừa push.
   - Vercel sẽ tự động nhận diện đây là dự án **Vite**.
   - Bấm **Deploy**.

## Cấu trúc dự án
- **src/MacNotes.jsx**: Mã nguồn chính của ứng dụng.
- **src/index.css**: Cấu hình Tailwind CSS v4.
- **vite.config.js**: Cấu hình Vite với plugin Tailwind.

## Chạy thử local
Để chạy thử trên máy của bạn:
```bash
npm run dev
```
