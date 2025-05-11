# GitHub RAG Chat

GitHubのコード、Issue、PRコメントをベクトル検索し、Geminiを使用してチャット形式で質問応答するアプリケーションです。

## 機能

- GitHubリポジトリのコード、Issue、PRコメントの全文検索
- pgvectorによる効率的なベクトル検索
- Google Gemini APIを使用した高精度な応答生成
- リアルタイムなWebhookによる差分更新
- ライセンス情報の追跡と引用

## セットアップ

1. 必要な環境変数を設定
```bash
cp .env.sample .env
```

2. 環境変数を編集
- `GITHUB_PAT`: GitHubのPersonal Access Token
- `DATABASE_URL`: PostgreSQLのURL（pgvector拡張が必要）
- `GEMINI_API_KEY`: Google Gemini APIキー
- `OPENAI_API_KEY`: OpenAI APIキー（埋め込み生成用）

3. 依存関係のインストール
```bash
npm install
```

4. データベースのマイグレーション
```bash
npx prisma migrate dev
```

5. 初回インデックス作成
```bash
npx ts-node scripts/initial-index.ts <owner> <repo>
```

6. 開発サーバーの起動
```bash
npm run dev
```

## アーキテクチャ

- Next.js (App Router)
- TypeScript
- PostgreSQL + pgvector
- Google Gemini API
- OpenAI Embeddings API

## ライセンス

MITライセンス
