# 青岛中旻国际贸易有限公司官网 —— 容器镜像
# 用于 CloudBase 云托管 / Apply.Build / 任意 Docker 平台部署
# 端口说明：默认 8080，若平台注入 PORT 环境变量则以注入值为准
FROM node:20-alpine

WORKDIR /app

# 先装依赖，利用镜像层缓存
COPY package.json package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund

# 再拷贝业务代码
COPY . .

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
