const moment = require('moment');
const authenticateToken = require('../config/authenticateToken');
const { successResponse, errorResponse } = require('../asset/response');
const { coreiotClient, COREIOT_DEVICE_ID } = require('../config/coreiot');

// Các key thực tế trên thiết bị Core IoT
const SENSOR_KEYS = [
  'temperature',
  'humidity',
  'soil_moisture',
  'ADC', // cảm biến mưa
  'fan_speed',
  'water_level',
];

const mergeTimeseriesByTimestamp = (rawData, keys) => {
  const merged = {};
  keys.forEach((key) => {
    (rawData[key] || []).forEach((item) => {
      if (!merged[item.ts]) {
        merged[item.ts] = {
          timestamp: item.ts,
          dateTime: moment(item.ts).format('YYYY-MM-DD HH:mm:ss.SSS'),
        };
      }
      merged[item.ts][key] = Number(item.value);
    });
  });
  return Object.values(merged).sort((a, b) => b.timestamp - a.timestamp);
};

const telemetry = (app) => {
  // Lấy realtime từ Core IoT
  app.get('/api/data/realtime', authenticateToken, async (req, res) => {
    try {
      const { getBy } = req.query;
      const keys = getBy
        ? getBy.split(',').map((k) => k.trim()).filter(Boolean)
        : SENSOR_KEYS;

      const { data } = await coreiotClient.get(
        `/plugins/telemetry/DEVICE/${COREIOT_DEVICE_ID}/values/timeseries`,
        {
          params: {
            keys: keys.join(','),
            limit: 1,
            orderBy: 'DESC',
            useStrictDataTypes: true,
          },
        }
      );

      const latest = {};
      keys.forEach((k) => {
        const arr = data[k];
        if (Array.isArray(arr) && arr.length) {
          latest[k] = Number(arr[0].value);
          latest.timestamp = arr[0].ts;
          latest.dateTime = moment(arr[0].ts).format('YYYY-MM-DD HH:mm:ss.SSS');
        }
      });

      // Alias cho FE
      if (latest.soil_moisture !== undefined && latest.soilMoisture === undefined) {
        latest.soilMoisture = latest.soil_moisture;
      }
      if (latest.water_level !== undefined && latest.waterLevel === undefined) {
        latest.waterLevel = latest.water_level;
      }
      if (latest.ADC !== undefined && latest.rainfall === undefined) {
        latest.rainfall = latest.ADC;
      }
      if (latest.fan_speed !== undefined && latest.fanSpeed === undefined) {
        latest.fanSpeed = latest.fan_speed;
      }

      if (!Object.keys(latest).length) {
        return errorResponse(res, 'Khong co du lieu realtime', 404);
      }

      return successResponse(res, latest, 'Lay du lieu realtime tu Core IoT');
    } catch (error) {
      return errorResponse(
        res,
        `Loi lay realtime tu Core IoT: ${error.message || 'Khong xac dinh'}`,
        500
      );
    }
  });

  // Lấy lịch sử từ Core IoT (merge theo timestamp)
  app.get('/api/data/history', authenticateToken, async (req, res) => {
    try {
      const { pageNum, pageSize, sortBy, from, to } = req.query;
      const ps = Number(pageSize) || 200;
      const pn = Number(pageNum) || 0;
      const startTs = from ? new Date(from).getTime() : undefined;
      const endTs = to ? new Date(to).getTime() : undefined;

      const { data } = await coreiotClient.get(
        `/plugins/telemetry/DEVICE/${COREIOT_DEVICE_ID}/values/timeseries`,
        {
          params: {
            keys: SENSOR_KEYS.join(','),
            startTs,
            endTs,
            limit: 10000,
            useStrictDataTypes: true,
          },
        }
      );

      let merged = mergeTimeseriesByTimestamp(data, SENSOR_KEYS);
      merged = merged.map((row) => {
        const next = { ...row };
        if (next.soilMoisture === undefined && next.soil_moisture !== undefined) {
          next.soilMoisture = next.soil_moisture;
        }
        if (next.waterLevel === undefined && next.water_level !== undefined) {
          next.waterLevel = next.water_level;
        }
        if (next.rainfall === undefined && next.ADC !== undefined) {
          next.rainfall = next.ADC;
        }
        if (next.fanSpeed === undefined && next.fan_speed !== undefined) {
          next.fanSpeed = next.fan_speed;
        }
        return next;
      });

      if (sortBy && sortBy.trim() === 'oldest') {
        merged = merged.reverse();
      }

      const sliced = merged.slice(pn * ps, pn * ps + ps);

      return successResponse(res, sliced);
    } catch (error) {
      return errorResponse(
        res,
        `Loi lay lich su tu Core IoT: ${error.message || 'Khong xac dinh'}`,
        500
      );
    }
  });

  // Dự đoán (linear regression) đơn giản cho cảm biến
  app.get('/api/data/predict', authenticateToken, async (req, res) => {
    try {
      const { aheadMinutes = 60, limit = 200, keys } = req.query;
      const selectedKeys = keys
        ? keys.split(',').map((k) => k.trim()).filter(Boolean)
        : SENSOR_KEYS;

      const now = Date.now();
      const defaultStart = now - 24 * 60 * 60 * 1000; // 24h gần nhất
      const { data } = await coreiotClient.get(
        `/plugins/telemetry/DEVICE/${COREIOT_DEVICE_ID}/values/timeseries`,
        {
          params: {
            keys: selectedKeys.join(','),
            startTs: defaultStart,
            endTs: now,
            limit: Number(limit) || 500,
            orderBy: 'DESC',
            useStrictDataTypes: true,
          },
        }
      );

      const aheadMs = Number(aheadMinutes) * 60 * 1000;

      const regress = (arr) => {
        if (!arr || arr.length === 0) return null;
        const sorted = [...arr].sort((a, b) => a.ts - b.ts);
        if (sorted.length === 1) {
          const only = sorted[0];
          return {
            current: Number(only.value),
            predicted: Number(only.value),
            delta: 0,
            lastTs: only.ts,
            predictTs: only.ts + aheadMs,
          };
        }
        const t0 = sorted[0].ts;
        const xs = sorted.map((p) => (p.ts - t0) / 60000); // phút
        const ys = sorted.map((p) => Number(p.value));
        const n = xs.length;
        const meanX = xs.reduce((a, b) => a + b, 0) / n;
        const meanY = ys.reduce((a, b) => a + b, 0) / n;
        let num = 0;
        let den = 0;
        for (let i = 0; i < n; i += 1) {
          num += (xs[i] - meanX) * (ys[i] - meanY);
          den += (xs[i] - meanX) ** 2;
        }
        const slope = den === 0 ? 0 : num / den; // value per minute
        const last = sorted[sorted.length - 1];
        const predictX = xs[xs.length - 1] + Number(aheadMinutes);
        const predictY = meanY + slope * (predictX - meanX);
        return {
          current: Number(last.value),
          predicted: Number(predictY),
          delta: Number(predictY - last.value),
          lastTs: last.ts,
          predictTs: last.ts + aheadMs,
        };
      };

      const result = {};
      selectedKeys.forEach((k) => {
        const reg = regress(data[k]);
        if (reg) {
          result[k] = reg;
        }
      });

      // Map alias cho FE
      if (result.soil_moisture && !result.soilMoisture) result.soilMoisture = result.soil_moisture;
      if (result.water_level && !result.waterLevel) result.waterLevel = result.water_level;
      if (result.ADC && !result.rainfall) result.rainfall = result.ADC;
      if (result.fan_speed && !result.fanSpeed) result.fanSpeed = result.fan_speed;

      return successResponse(res, result, 'Du doan xu huong (linear regression)');
    } catch (error) {
      return errorResponse(
        res,
        `Loi du doan tu Core IoT: ${error.message || 'Khong xac dinh'}`,
        500
      );
    }
  });

  // Tư vấn canh tác đơn giản dựa trên dữ liệu mới nhất
  app.get('/api/data/advisory', authenticateToken, async (req, res) => {
    try {
      const { data } = await coreiotClient.get(
        `/plugins/telemetry/DEVICE/${COREIOT_DEVICE_ID}/values/timeseries`,
        {
          params: {
            keys: SENSOR_KEYS.join(','),
            limit: 1,
            orderBy: 'DESC',
            useStrictDataTypes: true,
          },
        }
      );

      const latest = {};
      SENSOR_KEYS.forEach((k) => {
        const arr = data[k];
        if (Array.isArray(arr) && arr.length) {
          latest[k] = Number(arr[0].value);
          latest.timestamp = arr[0].ts;
          latest.dateTime = moment(arr[0].ts).format('YYYY-MM-DD HH:mm:ss.SSS');
        }
      });
      if (latest.soil_moisture !== undefined && latest.soilMoisture === undefined) {
        latest.soilMoisture = latest.soil_moisture;
      }
      if (latest.water_level !== undefined && latest.waterLevel === undefined) {
        latest.waterLevel = latest.water_level;
      }
      if (latest.ADC !== undefined && latest.rainfall === undefined) {
        latest.rainfall = latest.ADC;
      }
      if (latest.fan_speed !== undefined && latest.fanSpeed === undefined) {
        latest.fanSpeed = latest.fan_speed;
      }

      const advices = [];
      const soil = latest.soilMoisture;
      const rain = latest.rainfall;
      const temp = latest.temperature;
      const hum = latest.humidity;
      const water = latest.waterLevel;

      if (soil !== undefined) {
        if (soil < 30) advices.push('Đất khô: đề xuất tưới 5-10 phút và kiểm tra bơm.');
        else if (soil > 70) advices.push('Đất ẩm cao: tạm ngừng tưới để tránh úng.');
        else advices.push('Đất ẩm ổn: duy trì lịch tưới hiện tại.');
      }
      if (rain !== undefined && rain > 5) {
        advices.push('Lượng mưa cao: tạm dừng tưới để tiết kiệm nước.');
      }
      if (temp !== undefined && hum !== undefined) {
        if (temp > 32 && hum < 50) advices.push('Nhiệt độ cao, ẩm thấp: bật quạt/phun sương ngắn hạn.');
        if (temp < 18) advices.push('Nhiệt độ thấp: xem xét che chắn hoặc giảm thông gió.');
      }
      if (water !== undefined && water < 20) {
        advices.push('Mực nước thấp: bổ sung nước bể/nguồn cấp trước khi tưới tiếp.');
      }
      if (!advices.length) advices.push('Không đủ dữ liệu, vui lòng kiểm tra cảm biến.');

      return successResponse(res, { latest, advices }, 'Tu van canh tac don gian');
    } catch (error) {
      return errorResponse(
        res,
        `Loi tu van: ${error.message || 'Khong xac dinh'}`,
        500
      );
    }
  });
};

module.exports = telemetry;
