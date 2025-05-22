FROM node:18-slim

# Cài đặt MySQL và các công cụ cần thiết
RUN apt-get update && apt-get install -y \
    default-mysql-server \
    supervisor \
    wget \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép các file cấu hình
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Thiết lập MySQL
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=g_scores

# Thiết lập backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --force
COPY backend/ .
RUN npm run build

# Chỉnh sửa cấu hình backend để lắng nghe 0.0.0.0
RUN sed -i 's/localhost/0.0.0.0/g' dist/main.js || true

# Thiết lập frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .

# Chỉnh sửa cấu hình frontend để lắng nghe 0.0.0.0
RUN sed -i 's/localhost/0.0.0.0/g' node_modules/react-scripts/config/webpackDevServer.config.js || true
RUN sed -i 's/host: .*/host: "0.0.0.0",/g' node_modules/react-scripts/config/webpackDevServer.config.js || true

# Thiết lập biến môi trường
ENV DB_HOST=localhost
ENV DB_PORT=3306
ENV DB_USERNAME=root
ENV DB_PASSWORD=root
ENV DB_DATABASE=g_scores
ENV PORT=10000
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Mở các cổng cần thiết
EXPOSE 3306 5000 3000 10000 $PORT

# Khởi tạo supervisord để chạy tất cả các dịch vụ
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 