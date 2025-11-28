const axios = require('axios');

const requiredEnv = ['TB_BASE_URL', 'TB_TOKEN', 'TB_DEVICE_ID'];

const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  // eslint-disable-next-line no-console
  console.warn(
      `[ThingsBoard] Missing env: ${missing.join(', ')}. ` +
      'Set TB_BASE_URL, TB_TOKEN, TB_DEVICE_ID to enable Core IoT data source.',
  );
}

const tbClient = axios.create({
  baseURL: process.env.TB_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

tbClient.interceptors.request.use((config) => {
  if (process.env.TB_TOKEN) {
    config.headers['X-Authorization'] = `Bearer ${process.env.TB_TOKEN}`;
  }
  return config;
});

module.exports = {
  tbClient,
  tbDeviceId: process.env.TB_DEVICE_ID,
};
