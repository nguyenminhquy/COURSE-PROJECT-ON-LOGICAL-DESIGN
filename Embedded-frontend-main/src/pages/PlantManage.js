import React, { useEffect, useState } from 'react';
import Header from '../components/Header.js';
import Sidebar from '../components/Sidebar.js';
import SensorCard from '../components/SensorCard.js';
import Footer from '../components/Footer.js';
import {
  FaTemperatureHigh,
  FaWater,
  FaCloudRain,
  FaTint,
  FaLightbulb,
  FaPumpSoap,
  FaSeedling,
  FaFan,
} from 'react-icons/fa';
import api from '../services/api.js';

const thresholds = {
  temperature: { min: 15, max: 45 },
  humidity: { min: 20, max: 90 },
  rainfall: { min: 0, max: 30 },
  fan_speed: { min: 0, max: 90 },
};

const PlantManage = () => {
  const [data, setData] = useState({
    temperature: 0,
    humidity: 0,
    ledState: 0,
    pumpState: 0,
    rainfall: 0,
    soil_moisture: 0,
    waterLevel: 0,
    fan_speed: 0,
  });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/data/realtime');
        const sensorData = res.data?.data;

        if (sensorData) {
          setData(sensorData);
          evaluateAlerts(sensorData);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu cảm biến:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatus = (type, value) => {
    switch (type) {
      case 'Temperature':
        if (value < 20) return { label: 'Thấp' };
        if (value <= 30) return { label: 'Trung bình' };
        return { label: 'Cao' };
      case 'Humidity':
        if (value < 40) return { label: 'Thấp' };
        if (value <= 70) return { label: 'Trung bình' };
        return { label: 'Cao' };
      case 'Soil Moisture':
        if (value < 30) return { label: 'Thấp' };
        if (value <= 60) return { label: 'Trung bình' };
        return { label: 'Cao' };
      case 'Water Level':
        if (value < 10) return { label: 'Thấp' };
        if (value <= 20) return { label: 'Trung bình' };
        return { label: 'Cao' };
      case 'Rainfall':
        if (value < 5) return { label: 'Thấp' };
        if (value <= 15) return { label: 'Trung bình' };
        return { label: 'Cao' };
      case 'Fan Speed':
        if (value < 30) return { label: 'Thấp' };
        if (value <= 70) return { label: 'Trung bình' };
        return { label: 'Cao' };
      case 'LED State':
      case 'Pump State':
        return value === true ? { label: 'Bật' } : { label: 'Tắt' };
      default:
        return { label: '-' };
    }
  };

  const evaluateAlerts = (sensorData) => {
    const now = new Date().toLocaleString();
    const list = [];
    Object.entries(thresholds).forEach(([key, range]) => {
      const value = Number(sensorData[key] ?? sensorData[key === 'fan_speed' ? 'fanSpeed' : key]);
      if (Number.isNaN(value)) return;
      if (value < range.min || value > range.max) {
        list.push({
          key,
          value,
          ts: now,
          type: value < range.min ? 'Thấp' : 'Cao',
        });
      }
    });
    if (list.length) {
      setAlerts((prev) => [...list, ...prev].slice(0, 5));
    }
  };

  const sensors = [
    { icon: <FaTemperatureHigh />, title: 'Temperature', value: data.temperature, unit: '°C', group: 'env' },
    { icon: <FaTint />, title: 'Humidity', value: data.humidity, unit: '%', group: 'env' },
    { icon: <FaSeedling />, title: 'Soil Moisture', value: data.soil_moisture, unit: '%', group: 'env' },
    { icon: <FaCloudRain />, title: 'Rainfall', value: data.rainfall, unit: '%', group: 'env' },
    { icon: <FaWater />, title: 'Water Level', value: data.waterLevel, unit: 'cm', group: 'env' },
    { icon: <FaFan />, title: 'Fan Speed', value: data.fan_speed || data.fanSpeed, unit: '%', group: 'device' },
    { icon: <FaLightbulb />, title: 'LED State', value: data.ledState, unit: '', group: 'device' },
    { icon: <FaPumpSoap />, title: 'Pump State', value: data.pumpState, unit: '', group: 'device' },
  ];

  return (
    <>
      <Header />
      <Sidebar />
      <main className="page-shell page-shell--realtime">
        <div className="toast-stack">
          {alerts.map((a, idx) => (
            <div key={idx} className="toast">
              <div className="toast-title">Cảnh báo {a.key}</div>
              <div className="toast-content">
                Giá trị: {a.value} ({a.type}) • {a.ts}
              </div>
            </div>
          ))}
        </div>
        <div className="page-hero">
          <div className="title-wrap">
            <div className="eyebrow">Realtime</div>
            <h1 className="hero-title">SmartFarm Realtime Dashboard</h1>
            <p className="hero-sub">Giám sát trạng thái cảm biến theo thời gian thực.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          <section>
            <div className="eyebrow">Thông tin môi trường</div>
            <div className="sensor-grid">
              {sensors.filter((s) => s.group === 'env').map((sensor) => {
                const status = getStatus(sensor.title, sensor.value);
                const valueDisplay = Number(sensor.value || 0).toFixed(1);
                return (
                  <SensorCard
                    key={sensor.title}
                    icon={sensor.icon}
                    title={sensor.title}
                    value={valueDisplay}
                    unit={sensor.unit}
                    status={status.label}
                  />
                );
              })}
            </div>
          </section>

          <section>
            <div className="eyebrow">Trạng thái thiết bị</div>
            <div className="sensor-grid">
              {sensors.filter((s) => s.group === 'device').map((sensor) => {
                const status = getStatus(sensor.title, sensor.value);
                const valueDisplay =
                  sensor.title === 'LED State' || sensor.title === 'Pump State'
                    ? sensor.value === true
                      ? 'ON'
                      : 'OFF'
                    : Number(sensor.value || 0).toFixed(1);

                return (
                  <SensorCard
                    key={sensor.title}
                    icon={sensor.icon}
                    title={sensor.title}
                    value={valueDisplay}
                    unit={sensor.unit}
                    status={status.label}
                  />
                );
              })}
            </div>
          </section>
        </div>
      </main>
      <div className="footer-shell">
        <Footer />
      </div>
    </>
  );
};

export default PlantManage;
