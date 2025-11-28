import React, { useEffect, useMemo, useState } from 'react';
import { FaRobot, FaSeedling, FaCloudRain, FaTemperatureHigh, FaTint, FaWater, FaFan, FaLightbulb } from 'react-icons/fa';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import api from '../services/api';

const sensorPalette = {
  soilMoisture: '#34d399',
  rainfall: '#a855f7',
  temperature: '#f97316',
  humidity: '#22d3ee',
  waterLevel: '#60a5fa',
  fanSpeed: '#f43f5e',
};

const SENSOR_DEFS = [
  { key: 'soilMoisture', label: 'Soil Moisture (%)', unit: '%', icon: <FaSeedling /> },
  { key: 'rainfall', label: 'Rainfall (mm)', unit: 'mm', icon: <FaCloudRain /> },
  { key: 'temperature', label: 'Temperature (°C)', unit: '°C', icon: <FaTemperatureHigh /> },
  { key: 'humidity', label: 'Humidity (%)', unit: '%', icon: <FaTint /> },
  { key: 'waterLevel', label: 'Water Level (cm)', unit: 'cm', icon: <FaWater /> },
  { key: 'fanSpeed', label: 'Fan Speed (%)', unit: '%', icon: <FaFan /> },
];

const formatValue = (v) => (v === null || v === undefined ? '--' : Number(v).toFixed(2));

function AIPredict() {
  const [predict, setPredict] = useState({});
  const [advisory, setAdvisory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAdv, setLoadingAdv] = useState(true);

  useEffect(() => {
    const loadPredict = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/data/predict', { params: { aheadMinutes: 60, limit: 500 } });
        setPredict(res.data?.data || {});
      } catch (e) {
        setPredict({});
      } finally {
        setLoading(false);
      }
    };
    loadPredict();
    const id = setInterval(loadPredict, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const loadAdv = async () => {
      setLoadingAdv(true);
      try {
        const res = await api.get('/api/data/advisory');
        setAdvisory(res.data?.data?.advices || []);
      } catch (e) {
        setAdvisory([]);
      } finally {
        setLoadingAdv(false);
      }
    };
    loadAdv();
    const id = setInterval(loadAdv, 60_000);
    return () => clearInterval(id);
  }, []);

  const cards = useMemo(() => {
    return SENSOR_DEFS.map((s) => {
      const raw =
        predict[s.key] ||
        predict[s.key === 'soilMoisture' ? 'soil_moisture' : s.key === 'waterLevel' ? 'water_level' : s.key] ||
        (s.key === 'rainfall' ? predict.ADC : null);
      return {
        ...s,
        color: sensorPalette[s.key] || '#22c55e',
        current: raw?.current,
        predicted: raw?.predicted,
        delta: raw?.delta,
      };
    });
  }, [predict]);

  return (
    <>
      <Header />
      <Sidebar />
      <main className="page-shell page-shell--ai">
        <div className="page-hero">
          <div className="title-wrap">
            <div className="eyebrow">AI</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FaRobot style={{ fontSize: 28, color: '#22d3ee' }} />
              <h1 className="hero-title" style={{ margin: 0 }}>AI Dự đoán (60 phút tới)</h1>
            </div>
            <p className="hero-sub">Linear regression nhanh trên chuỗi thời gian gần đây + tư vấn tự động.</p>
          </div>
        </div>

        {loading ? (
          <p style={{ paddingTop: 100, textAlign: 'center' }}>Đang tính toán dự đoán...</p>
        ) : (
          <div className="sensor-grid">
            {cards.map((card) => (
              <div
                key={card.key}
                className="chart-card"
                style={{
                  padding: 14,
                  border: `1px solid ${card.color}33`,
                  minHeight: 120,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: `${card.color}1a`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color,
                      }}
                    >
                      {card.icon}
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      {card.label}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '6px 10px',
                      borderRadius: 12,
                      background: (card.delta || 0) >= 0 ? '#dcfce7' : '#fee2e2',
                      color: (card.delta || 0) >= 0 ? '#16a34a' : '#ef4444',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {(card.delta || 0) >= 0 ? '▲' : '▼'} {formatValue(Math.abs(card.delta || 0))}
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: card.color, marginTop: 6 }}>
                  {formatValue(card.predicted)} <span style={{ fontSize: 13, color: '#94a3b8' }}>{card.unit}</span>
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                  Hiện tại: {formatValue(card.current)} {card.unit}
                </div>
              </div>
            ))}
          </div>
        )}

        <section style={{ marginTop: 20 }}>
          <div className="chart-card" style={{ padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <FaLightbulb style={{ color: '#facc15', fontSize: 20 }} />
              <h3 style={{ margin: 0 }}>AI Tư vấn nông nghiệp</h3>
            </div>
            {loadingAdv ? (
              <p style={{ margin: 0, color: '#94a3b8' }}>Đang tổng hợp tư vấn...</p>
            ) : advisory.length ? (
              <ul style={{ margin: 0, paddingLeft: 18, color: '#e5eaf3', lineHeight: 1.6 }}>
                {advisory.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: '#94a3b8' }}>Chưa có tư vấn. Kiểm tra lại dữ liệu cảm biến.</p>
            )}
          </div>
        </section>
      </main>
      <div className="footer-shell">
        <Footer />
      </div>
    </>
  );
}

export default AIPredict;
