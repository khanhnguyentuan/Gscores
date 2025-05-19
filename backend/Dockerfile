FROM node:18-slim

WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install --force

# Copy toàn bộ source code sau khi install
COPY . .

# Build ứng dụng
RUN npm run build

# Expose port
EXPOSE 5000

# Start app
CMD ["node", "dist/main"]
