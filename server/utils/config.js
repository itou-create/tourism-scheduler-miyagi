import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
  gtfsDataUrl: process.env.GTFS_DATA_URL,
  gtfsDbPath: process.env.GTFS_DB_PATH || './gtfs_data',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL
};

export const gtfsConfig = {
  agencies: [
    {
      // 仙台市営バス
      path: join(__dirname, '../gtfs_data/sendai_bus.zip')
    },
    {
      // 七ヶ浜町民バス「ぐるりんこ」
      path: join(__dirname, '../gtfs_data/shichigahama_gururinko.zip')
    }
  ],
  // PostgreSQLを使用する場合はDATABASE_URL、それ以外はSQLiteを使用
  ...(config.databaseUrl
    ? {
        db: {
          client: 'pg',
          connection: config.databaseUrl
        }
      }
    : {
        sqlitePath: join(__dirname, '../gtfs_data/gtfs.db')
      }
  ),
  verbose: config.nodeEnv === 'development',
  ignoreDuplicates: true
};
