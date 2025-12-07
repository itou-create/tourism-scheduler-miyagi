import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30秒のタイムアウト
});

/**
 * スケジュール生成API
 */
export const generateSchedule = async (params) => {
  const response = await api.post('/scheduler/generate', params);
  return response.data;
};

/**
 * 観光スポット検索API
 */
export const searchSpots = async (lat, lon, theme, radius = 5000) => {
  const response = await api.get('/spots/search', {
    params: { lat, lon, theme, radius }
  });
  return response.data;
};

/**
 * 近隣の停留所検索API
 */
export const findNearbyStops = async (lat, lon, radius = 0.5) => {
  const response = await api.get('/gtfs/stops/nearby', {
    params: { lat, lon, radius }
  });
  return response.data;
};

/**
 * ヘルスチェック
 */
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
