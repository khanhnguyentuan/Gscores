# G-Scores

Ứng dụng web hiển thị và báo cáo điểm thi THPT 2024.

## Tính năng

- Tra cứu điểm thi theo số báo danh
- Báo cáo thống kê điểm theo 4 mức: >=8, 6-8, 4-6, <4
- Danh sách top 10 học sinh khối A (Toán, Lý, Hóa)
- Giao diện responsive, thân thiện với người dùng

## Công nghệ sử dụng

- **Backend**: NestJS (NodeJS) với TypeScript và TypeORM
- **Frontend**: React với TypeScript
- **Database**: MySQL
- **Container**: Docker và Docker Compose
- **Deployment**: Vercel cho Frontend, Fly.io cho Backend

## Cấu trúc dự án

```
g-scores/
├── backend/           # NestJS API server
├── frontend/          # React client application
├── docker-compose.yml # Docker Compose configuration
└── README.md          # Project documentation
```

## Hướng dẫn cài đặt

### Yêu cầu

- Docker và Docker Compose
- Node.js (phiên bản 16+)
- npm hoặc yarn

### Cài đặt với Docker

1. Clone repository
   ```bash
   git clone <repository-url>
   cd g-scores
   ```

2. Khởi động ứng dụng với Docker Compose
   ```bash
   docker-compose up -d
   ```

3. Truy cập ứng dụng tại:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Cài đặt thủ công

1. Clone repository
   ```bash
   git clone <repository-url>
   cd g-scores
   ```

2. Cài đặt dependencies cho Backend
   ```bash
   cd backend
   npm install
   # Cấu hình file .env (xem .env.example)
   npm run start:dev
   ```

3. Cài đặt dependencies cho Frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Truy cập ứng dụng tại:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Đóng góp

Dự án được phát triển bởi [Tên của bạn] cho bài tập thực tập tại Golden Owl. 