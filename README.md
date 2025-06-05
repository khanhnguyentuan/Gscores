Ứng dụng web hiển thị và phân tích điểm thi THPT 2024.

## Tính năng

- Tra cứu điểm thi theo số báo danh
- Phân tích điểm theo 4 mức: >=8, 6-8, 4-6, <4
- Danh sách top học sinh khối A (Toán, Lý, Hóa)
- Giao diện responsive, thân thiện với người dùng
## Demo video ( trong trường hợp BE hết hạn)
[![Demo video](https://img.youtube.com/vi/6xFmjgz3O5M/hqdefault.jpg)](https://youtu.be/6xFmjgz3O5M)
## Giao diện
- Tra cứu điểm thi
![image](https://github.com/user-attachments/assets/72ecf792-49ac-4e78-84b5-294353861294)
- Thống kê 10 học sinh top
  ![image](https://github.com/user-attachments/assets/febbd68c-76a9-42a1-971c-65c4670bd3d9)

- Báo cáo phân loại
  ![image](https://github.com/user-attachments/assets/202ae95a-97c3-49fa-8207-f6336dae76c1)



## Công nghệ sử dụng

- **Backend**: NestJS (NodeJS) với TypeScript và TypeORM
- **Frontend**: React với TypeScript và TailwindCSS
- **Database**: MySQL (phát triển) / PostgreSQL (triển khai)
- **Container**: Docker và Docker Compose
- **Deployment**: Railways, Vercel (Backend, Frontend, Database)

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
   git clone https://github.com/khanhnguyentuan/Gscores.git
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
   git clone https://github.com/khanhnguyentuan/Gscores.git
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


## Đóng góp

Dự án được phát triển cho mục đích học tập và tìm hiểu về phân tích dữ liệu điểm thi. 

# G-Scores Dockerfile Tất Cả Trong Một

File Dockerfile này kết hợp tất cả các dịch vụ (MySQL, Backend, Frontend) vào một container duy nhất, thay thế cho thiết lập docker-compose ban đầu.

## Cách sử dụng

### Xây dựng image

```bash
# Đảm bảo bạn đang ở thư mục gốc (g-scores)
docker build -t g-scores-all-in-one .
```

### Chạy container

```bash
docker run -d -p 3306:3306 -p 5000:5000 -p 3000:3000 -v ./dataset:/app/backend/dataset --name g-scores g-scores-all-in-one
```

### Truy cập các dịch vụ

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MySQL Database: localhost:3306

## Lưu ý

- Giải pháp này kết hợp tất cả dịch vụ vào một container và không được khuyến nghị cho môi trường sản xuất
- Để phát triển, thiết lập docker-compose ban đầu thường linh hoạt hơn
- Container này sẽ sử dụng nhiều tài nguyên hơn vì chạy nhiều dịch vụ cùng lúc
- Nếu một dịch vụ gặp sự cố, Supervisord sẽ cố gắng khởi động lại nó
