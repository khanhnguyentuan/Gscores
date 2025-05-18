# G-Scores

Ứng dụng web hiển thị và phân tích điểm thi THPT 2024.

## Tính năng

- Tra cứu điểm thi theo số báo danh
- Phân tích điểm theo 4 mức: >=8, 6-8, 4-6, <4
- Danh sách top học sinh khối A (Toán, Lý, Hóa)
- Giao diện responsive, thân thiện với người dùng

## Công nghệ sử dụng

- **Backend**: NestJS (NodeJS) với TypeScript và TypeORM
- **Frontend**: React với TypeScript và TailwindCSS
- **Database**: MySQL (phát triển) / PostgreSQL (triển khai)
- **Container**: Docker và Docker Compose
- **Deployment**: Render (Backend, Frontend, Database)

## Cấu trúc dự án

```
g-scores/
├── backend/           # NestJS API server
├── frontend/          # React client application
├── dataset/           # Dữ liệu mẫu điểm thi
├── docker-compose.yml # Docker Compose configuration
├── render.yaml        # Render deployment configuration
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
   
   Hoặc chạy từng service riêng biệt:
   ```bash
   # Chỉ chạy database
   docker-compose up -d mysql
   
   # Chỉ chạy backend
   docker-compose up -d backend
   
   # Chỉ chạy frontend
   docker-compose up -d frontend
   ```

3. Truy cập ứng dụng tại:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Swagger API docs: http://localhost:5000/api

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
   npm start
   ```

4. Truy cập ứng dụng tại:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Triển khai

### Triển khai trên Render

Dự án được cấu hình sẵn để triển khai trên Render sử dụng file `render.yaml`:

1. Fork repository này về tài khoản GitHub của bạn
2. Đăng ký tài khoản trên [Render](https://render.com)
3. Tạo một Blueprint mới với repo GitHub của bạn
4. Render sẽ tự động triển khai backend, frontend và database

## Đóng góp

Dự án được phát triển cho mục đích học tập và tìm hiểu về phân tích dữ liệu điểm thi. 