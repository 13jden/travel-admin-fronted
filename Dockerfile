# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 设置时区
ENV TZ=Asia/Shanghai

# 复制package文件
COPY package*.json ./

# 安装所有依赖（包括devDependencies，构建需要vite）
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 运行阶段 - 使用nginx
FROM nginx:alpine

# 设置时区
ENV TZ=Asia/Shanghai

# 复制构建好的文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx/default.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 健康检查 - 修改为访问 80 端口
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
