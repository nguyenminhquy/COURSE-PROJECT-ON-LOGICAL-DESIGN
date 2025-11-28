const axios = require('axios');
require('dotenv').config();

const COREIOT_BASE = process.env.COREIOT_BASE || 'https://app.coreiot.io/api';
const COREIOT_TOKEN = process.env.COREIOT_TOKEN || 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJxdXkubmd1eWVuMDUwMTA0QGhjbXV0LmVkdS52biIsInVzZXJJZCI6ImM1MTU0ZTUwLWUxZGItMTFlZi1hZDA5LTUxNWY3OTBlZDlkZiIsInNjb3BlcyI6WyJURU5BTlRfQURNSU4iXSwic2Vzc2lvbklkIjoiZDcyNGE3MTAtZGVmNS00ZTkxLTllNWUtYjRmMGZlZjFjNDZlIiwiZXhwIjoxNzY0MzQwOTI4LCJpc3MiOiJjb3JlaW90LmlvIiwiaWF0IjoxNzY0MzMxOTI4LCJmaXJzdE5hbWUiOiJRVcOdIiwibGFzdE5hbWUiOiJOR1VZ4buETiBNSU5IIiwiZW5hYmxlZCI6dHJ1ZSwiaXNQdWJsaWMiOmZhbHNlLCJ0ZW5hbnRJZCI6ImM1MGIzYzMwLWUxZGItMTFlZi1hZDA5LTUxNWY3OTBlZDlkZiIsImN1c3RvbWVySWQiOiIxMzgxNDAwMC0xZGQyLTExYjItODA4MC04MDgwODA4MDgwODAifQ.--il60-PAY8cBwCvCiJZhjCD4els_PHvIglARUUFR8hNTa0LfFePPUZjB0esUvOndx8ZTtkqXx39SQiEj62oyQ';
const COREIOT_DEVICE_ID = process.env.COREIOT_DEVICE_ID || 'ztx0lfbkjif28tzgt889';

const coreiotClient = axios.create({
  baseURL: COREIOT_BASE,
});

coreiotClient.interceptors.request.use((config) => {
  if (!config.headers) config.headers = {};
  config.headers['X-Authorization'] = `Bearer ${COREIOT_TOKEN}`;
  return config;
});

module.exports = {
  coreiotClient,
  COREIOT_DEVICE_ID,
};
