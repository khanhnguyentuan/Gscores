# G-Scores Frontend

Ứng dụng frontend cho hệ thống quản lý điểm số G-Scores.

## Tính năng chính

- **Tra cứu điểm**: Tìm kiếm điểm số học sinh theo mã số
- **Bảng điều khiển**: Hiển thị bảng xếp hạng top 10 học sinh khối A (Toán, Lý, Hóa)
- **Báo cáo**: Thống kê và biểu đồ số lượng học sinh theo từng cấp độ điểm cho mỗi môn học
- **Cài đặt**: Tùy chỉnh giao diện người dùng

## Công nghệ sử dụng

- React 18
- TypeScript
- React Router 6
- TailwindCSS
- Chart.js & React-chartjs-2
- Axios

## Thiết lập và chạy ứng dụng

1. Cài đặt các phụ thuộc:
```
npm install
```

2. Khởi chạy ứng dụng ở môi trường phát triển:
```
npm start
```

3. Truy cập ứng dụng tại:
```
http://localhost:3000
```

## API Backend

Ứng dụng sử dụng API backend được cung cấp tại địa chỉ:
```
http://localhost:5000/api
```

## Cấu trúc thư mục

- `/src/api`: Chứa các hàm gọi API
- `/src/components`: Các component dùng chung
- `/src/pages`: Các trang của ứng dụng
- `/src/types`: Định nghĩa kiểu dữ liệu TypeScript

## Giao diện

- Thanh header có màu nền: `rgba(15,34,137,255)`
- Thanh sidebar có gradient từ: `rgba(250,214,3,255)` đến `rgba(65,136,146,255)`
- Font chữ: Rubik 