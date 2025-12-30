import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import schedulerRoutes from './routes/scheduler.js';
import gtfsRoutes from './routes/gtfs.js';
import spotsRoutes from './routes/spots.js';
import sendaiOpenDataService from './services/sendaiOpenDataService.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',  // 開発環境
    'https://itou-create.github.io'  // 本番環境（GitHub Pages）
  ]
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

// ルートパスの説明
app.get('/', (req, res) => {
  res.json({
    name: 'Tourism Scheduler API',
    version: '1.0.0',
    description: '宮城県観光周遊スケジュール自動生成API',
    frontend: 'https://itou-create.github.io/tourism-scheduler-miyagi',
    endpoints: {
      health: '/api/health',
      scheduler: {
        generate: 'POST /api/scheduler/generate'
      },
      spots: {
        search: 'GET /api/spots/search?lat=<lat>&lon=<lon>&theme=<theme>&radius=<radius>'
      },
      gtfs: {
        nearbyStops: 'GET /api/gtfs/stops/nearby?lat=<lat>&lon=<lon>&radius=<radius>'
      }
    },
    documentation: 'https://github.com/itou-create/tourism-scheduler-miyagi'
  });
});

// 404ハンドラー（API以外のルート）
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      path: req.path
    }
  });
});

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
