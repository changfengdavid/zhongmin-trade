# 青岛中旻国际贸易有限公司官网 —— 容器镜像
# 用于腾讯云开发 CloudBase 云托管 / 任意 Docker 平台部署
FROM node:20-alpine

WORKDIR /app

# 先装依赖，利用镜像层缓存
COPY package.json package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund

# 再拷贝业务代码
COPY . .

ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80

CMD ["node", "server.js"]
