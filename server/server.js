import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import schedulerRoutes from './routes/scheduler.js';
import gtfsRoutes from './routes/gtfs.js';
import spotsRoutes from './routes/spots.js';
import sendaiOpenDataService from './services/sendaiOpenDataService.js';

dotenv.config({ path: '../.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/gtfs', gtfsRoutes);
app.use('/api/spots', spotsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tourism Scheduler API is running' });
});

// 静的ファイル配信（本番環境）
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDistPath));

  // SPAのフォールバック処理（API以外のルートはindex.htmlを返す）
  app.get('*', (req, res) => {
    // APIルートは除外
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        error: {
          message: 'API route not found',
          status: 404
        }
      });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // 開発環境では404を返す
  app.use((req, res) => {
    res.status(404).json({
      error: {
        message: 'Route not found',
        status: 404
      }
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);

  // 仙台市オープンデータをバックグラウンドで初期化
  console.log('\n🔄 仙台市オープンデータを初期化中...');
  sendaiOpenDataService.initialize()
    .then(() => {
      console.log('✅ サーバーの初期化が完了しました\n');
    })
    .catch((error) => {
      console.error('⚠️  オープンデータの初期化に失敗しました:', error);
      console.log('⚠️  サーバーは起動していますが、一部機能が制限される可能性があります\n');
    });
});
