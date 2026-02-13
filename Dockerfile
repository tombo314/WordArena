FROM node:20 AS builder

WORKDIR /app

# 依存関係をインストール
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm run install:all

# ソースコードをコピー
COPY . .

# クライアントをビルド
RUN npm run build:client

# サーバーをビルド (TypeScript → JavaScript)
RUN npm --prefix server run build

# sqlite3 はネイティブモジュールなので builder 上でプロダクション用ビルド
WORKDIR /app/server
RUN npm install --omit=dev

# 本番用イメージ
FROM node:20-slim
WORKDIR /app

# 必要なファイルのみコピー
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/data ./server/data
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/client/dist ./client/dist

WORKDIR /app/server

# ポート設定
ENV PORT=8080
EXPOSE 8080

# 起動コマンド
CMD ["node", "dist/server.js"]
