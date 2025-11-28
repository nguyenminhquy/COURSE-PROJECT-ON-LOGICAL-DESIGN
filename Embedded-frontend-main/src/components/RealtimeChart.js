import React, { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Filler,
} from 'chart.js';

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip, Filler);

const RealtimeChart = ({ data, sensor }) => {
  const canvasRef = useRef(null);

  const sortedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return [...data].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  }, [data]);

  const labels = sortedData.map((d) => d.dateTime);
  const values = sortedData.map((d) => d[sensor.key]);
  const latestValue = values.length ? values[values.length - 1] : null;

  const gradientFill = (ctx) => {
    if (!ctx.chart || !canvasRef.current) return sensor.color;
    const { ctx: g } = ctx.chart;
    const gradient = g.createLinearGradient(0, 0, 0, ctx.chart.height || 240);
    gradient.addColorStop(0, `${sensor.color}55`);
    gradient.addColorStop(1, `${sensor.color}08`);
    return gradient;
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1.6,
    scales: {
      y: {
        beginAtZero: false,
        title: { display: false },
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#e5e7eb', maxTicksLimit: 6 },
      },
      x: {
        title: { display: false },
        ticks: { autoSkip: true, maxTicksLimit: 6, color: '#94a3b8' },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
            title: (items) => items?.[0]?.label || '',
            label: (ctx) => `${sensor.label}: ${ctx.formattedValue}`,
        },
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: sensor.label,
        data: values,
        backgroundColor: (ctx) => gradientFill(ctx),
        borderColor: sensor.color,
        borderWidth: 2.2,
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#0b1220',
        pointBorderWidth: 2,
        pointBorderColor: sensor.color,
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{sensor.label}</h3>
        <div style={{ fontWeight: 800, color: sensor.color }}>
          {latestValue !== null ? Number(latestValue).toFixed(2) : '--'}
        </div>
      </div>
      <div style={{ height: 240 }}>
        <Line ref={canvasRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RealtimeChart;
