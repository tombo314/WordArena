# Word Arena

## 起動方法

### 開発時

ターミナルを2つ使用します。

```bash
# フロントエンド (Vite dev server, port 5173)
npm run dev:client

# バックエンド (Node.js, port 8000)
npm run dev:server
```

ブラウザで `http://localhost:5173` にアクセス。

### 本番

```bash
npm run build:client
npm start
```

ブラウザで `http://localhost:8000` にアクセス。

### Docker

```bash
docker build -t word-arena .
docker run -p 8080:8080 word-arena
```

ブラウザで `http://localhost:8080` にアクセス。
