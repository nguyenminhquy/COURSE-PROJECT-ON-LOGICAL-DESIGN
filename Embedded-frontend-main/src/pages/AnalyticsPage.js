import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

const sensorPalette = {
  temperature: '#f97316',
  humidity: '#22d3ee',
  soilMoisture: '#34d399',
  rainfall: '#a855f7',
  waterLevel: '#60a5fa',
  fanSpeed: '#f43f5e',
};

const SENSOR_DEFS = [
  { key: 'temperature', label: 'Temperature (°C)', unit: '°C' },
  { key: 'humidity', label: 'Humidity (%)', unit: '%' },
  { key: 'soilMoisture', label: 'Soil Moisture (%)', unit: '%' },
  { key: 'rainfall', label: 'Rainfall (mm)', unit: 'mm' },
  { key: 'waterLevel', label: 'Water Level (cm)', unit: 'cm' },
  { key: 'fanSpeed', label: 'Fan Speed (%)', unit: '%' },
];

const rangesCfg = {
  '24h': { label: '24 giờ', ms: 24 * 60 * 60 * 1000 },
  '7d': { label: '1 tuần', ms: 7 * 24 * 60 * 60 * 1000 },
  '1m': { label: '1 tháng', ms: 30 * 24 * 60 * 60 * 1000 },
  '3m': { label: '3 tháng', ms: 90 * 24 * 60 * 60 * 1000 },
};

const formatTime = (d) =>
  new Date(d || Date.now()).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });

function AnalyticsPage() {
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('24h');
  const [predict, setPredict] = useState({});
  const [predictLoading, setPredictLoading] = useState(false);

  const fetchData = useCallback(
    async (rangeKey) => {
      setLoading(true);
      const now = new Date();
      const cfg = rangesCfg[rangeKey] || rangesCfg['24h'];
      const from = new Date(now.getTime() - cfg.ms);
      try {
        const res = await api.get('/api/data/history', { params: { from } });
        setAnalysis(res.data?.data || []);
      } catch (e) {
        setAnalysis([]);
      } finally {
        setLoading(false);
      }
    },
    [setAnalysis],
  );

  useEffect(() => {
    fetchData(selectedRange);
  }, [selectedRange, fetchData]);

  useEffect(() => {
    const loadPredict = async () => {
      setPredictLoading(true);
      try {
        const res = await api.get('/api/data/predict', {
          params: { aheadMinutes: 60, limit: 200 },
        });
        setPredict(res.data?.data || {});
      } catch (e) {
        setPredict({});
      } finally {
        setPredictLoading(false);
      }
    };
    loadPredict();
  }, [selectedRange]);

  const labels = useMemo(() => analysis.map((item) => formatTime(item.dateTime || item.timestamp)), [analysis]);

  const series = useMemo(() => {
    const map = {};
    SENSOR_DEFS.forEach((s) => (map[s.key] = []));
    analysis.forEach((row) => {
      SENSOR_DEFS.forEach((s) => {
        const val =
          row[s.key] ??
          row[s.key === 'fanSpeed' ? 'fan_speed' : s.key] ??
          (s.key === 'rainfall' ? row.ADC : undefined);
        map[s.key].push(Number(val ?? 0));
      });
    });
    return map;
  }, [analysis]);

  const latest = (key) => {
    const arr = series[key];
    if (!arr || !arr.length) return null;
    return arr[arr.length - 1];
  };

  const delta = (key) => {
    const arr = series[key];
    if (!arr || arr.length < 2) return 0;
    return arr[arr.length - 1] - arr[arr.length - 2];
  };

  const buildLineData = (keys) => ({
    labels,
    datasets: keys.map((k) => ({
      label: SENSOR_DEFS.find((s) => s.key === k)?.label || k,
      data: series[k] || [],
      borderColor: sensorPalette[k] || '#22c55e',
      backgroundColor: (ctx) => {
        const c = sensorPalette[k] || '#22c55e';
        if (!ctx.chart) return c;
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
        g.addColorStop(0, `${c}55`);
        g.addColorStop(1, `${c}05`);
        return g;
      },
      tension: 0.35,
      fill: true,
      borderWidth: 2,
      pointRadius: 0,
    })),
  });

  const buildBarLineData = (barKey, lineKey) => ({
    labels,
    datasets: [
      {
        type: 'bar',
        label: SENSOR_DEFS.find((s) => s.key === barKey)?.label || barKey,
        data: series[barKey] || [],
        backgroundColor: `${sensorPalette[barKey] || '#22c55e'}aa`,
        borderRadius: 10,
      },
      {
        type: 'line',
        label: SENSOR_DEFS.find((s) => s.key === lineKey)?.label || lineKey,
        data: series[lineKey] || [],
        borderColor: sensorPalette[lineKey] || '#0ea5e9',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  });

  const doughnutData = useMemo(() => {
    const keys = ['temperature', 'humidity', 'soilMoisture', 'rainfall', 'waterLevel'];
    const values = keys.map((k) => {
      const arr = series[k] || [];
      if (!arr.length) return 0;
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    });
    return {
      labels: keys.map((k) => SENSOR_DEFS.find((s) => s.key === k)?.label || k),
      datasets: [
        {
          data: values,
          backgroundColor: keys.map((k) => sensorPalette[k]),
          borderColor: '#0b1220',
          borderWidth: 2,
        },
      ],
    };
  }, [series]);

  const kpiCards = SENSOR_DEFS.filter((_, idx) => idx < 5).map((s) => ({
    ...s,
    color: sensorPalette[s.key],
    value: latest(s.key),
    delta: delta(s.key),
  }));

  const predictCards = [
    'soilMoisture',
    'rainfall',
    'temperature',
    'humidity',
    'waterLevel',
    'fanSpeed',
  ].map((k) => {
    const base = SENSOR_DEFS.find((s) => s.key === k) || { key: k, label: k, unit: '' };
    const entry = predict[k] || {};
    return {
      ...base,
      color: sensorPalette[k] || '#22c55e',
      current: entry.current,
      predicted: entry.predicted,
      delta: entry.delta,
    };
  });

  return (
    <>
      <Header />
      <Sidebar />
      <main className="page-shell page-shell--analytics">
        <div className="page-hero">
          <div className="title-wrap">
            <div className="eyebrow">Analytics</div>
            <h1 className="hero-title">Phân tích dữ liệu</h1>
            <p className="hero-sub">
              Biểu đồ xu hướng {rangesCfg[selectedRange]?.label || '24 giờ'} gần nhất.
            </p>
          </div>
          <div className="range-picker">
            {Object.entries(rangesCfg).map(([key, cfg]) => (
              <button
                key={key}
                className={`range-btn ${selectedRange === key ? 'active' : ''}`}
                onClick={() => setSelectedRange(key)}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ paddingTop: 100, textAlign: 'center' }}>Đang tải dữ liệu phân tích...</p>
        ) : (
          <>
            <div className="sensor-grid" style={{ marginBottom: 16 }}>
              {kpiCards.map((card) => (
                <div
                  key={card.key}
                  className="chart-card"
                  style={{
                    padding: 14,
                    border: `1px solid ${card.color}33`,
                    minHeight: 120,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: 0.6,
                        }}
                      >
                        {card.label}
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>
                        {card.value !== null && card.value !== undefined ? card.value.toFixed(1) : '--'}{' '}
                        <span style={{ fontSize: 14, color: '#94a3b8' }}>{card.unit}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '6px 10px',
                        borderRadius: 12,
                        background: card.delta >= 0 ? '#dcfce7' : '#fee2e2',
                        color: card.delta >= 0 ? '#16a34a' : '#ef4444',
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {card.delta >= 0 ? '▲' : '▼'} {Math.abs(card.delta || 0).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ height: 24, marginTop: 6, opacity: 0.7, fontSize: 12, color: '#94a3b8' }}>
                    Cập nhật: {labels[labels.length - 1] || '--'}
                  </div>
                </div>
              ))}
            </div>

            <section style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}>AI Dự đoán (60 phút tới)</h3>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>
                  Mô hình: linear regression nhanh trên chuỗi thời gian gần đây
                </span>
              </div>
              {predictLoading && <p style={{ margin: 0, color: '#94a3b8' }}>Đang tính toán dự đoán...</p>}
              <div className="sensor-grid">
                {predictCards.map((card) => (
                  <div
                    key={card.key}
                    className="chart-card"
                    style={{
                      padding: 14,
                      border: `1px solid ${card.color}33`,
                      minHeight: 120,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                        {card.label}
                      </div>
                      <div
                        style={{
                          padding: '6px 10px',
                          borderRadius: 12,
                          background: card.delta >= 0 ? '#dcfce7' : '#fee2e2',
                          color: card.delta >= 0 ? '#16a34a' : '#ef4444',
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {card.delta >= 0 ? '▲' : '▼'} {Math.abs(card.delta || 0).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: card.color, marginTop: 6 }}>
                      {card.predicted !== undefined && card.predicted !== null
                        ? card.predicted.toFixed(1)
                        : '--'}{' '}
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>{card.unit}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                      Hiện tại: {card.current !== undefined && card.current !== null ? card.current.toFixed(1) : '--'}{' '}
                      {card.unit}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="chart-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
              <div className="chart-card">
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Xu hướng môi trường</h3>
                <div style={{ height: 260 }}>
                  <Line
                    data={buildLineData(['temperature', 'humidity', 'soilMoisture'])}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top', labels: { color: '#e5e7eb', boxWidth: 12 } } },
                      scales: {
                        x: { ticks: { color: '#94a3b8', maxTicksLimit: 8 }, grid: { display: false } },
                        y: { ticks: { color: '#e5e7eb' }, grid: { color: 'rgba(255,255,255,0.08)' } },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="chart-card">
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Nước & Mưa</h3>
                <div style={{ height: 260 }}>
                  <Bar
                    data={buildBarLineData('waterLevel', 'rainfall')}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top', labels: { color: '#e5e7eb', boxWidth: 12 } } },
                      scales: {
                        x: { ticks: { color: '#94a3b8', maxTicksLimit: 8 }, grid: { display: false } },
                        y: { ticks: { color: '#e5e7eb' }, grid: { color: 'rgba(255,255,255,0.08)' } },
                        y1: {
                          position: 'right',
                          ticks: { color: '#e5e7eb' },
                          grid: { drawOnChartArea: false },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="chart-card">
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Tốc độ quạt</h3>
                <div style={{ height: 260 }}>
                  <Line
                    data={buildLineData(['fanSpeed'])}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { ticks: { color: '#94a3b8', maxTicksLimit: 8 }, grid: { display: false } },
                        y: { ticks: { color: '#e5e7eb' }, grid: { color: 'rgba(255,255,255,0.08)' } },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="chart-card">
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Trung bình cảm biến</h3>
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Doughnut
                    data={doughnutData}
                    options={{
                      plugins: {
                        legend: { position: 'right', labels: { color: '#e5e7eb', boxWidth: 12 } },
                      },
                      cutout: '55%',
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <div className="footer-shell">
        <Footer />
      </div>
    </>
  );
}

export default AnalyticsPage;
