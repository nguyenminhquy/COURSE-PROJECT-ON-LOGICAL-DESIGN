import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

function TelemetryChart({ data, sensorKey }) {
  if (!data || !data[sensorKey] || data[sensorKey].length === 0) {
    return <p>Không có dữ liệu cho {sensorKey}</p>;
  }

  const labels = data[sensorKey].map(d => new Date(d.ts).toLocaleString());
  const values = data[sensorKey].map(d => parseFloat(d.value));

  const chartData = {
    labels,
    datasets: [
      {
        label: sensorKey,
        data: values,
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,  // cho phép set chiều cao tùy ý
    plugins: {
      title: {
        display: true,
        text: `Biểu đồ dữ liệu ${sensorKey}`,
      },
    },
    scales: {
      x: {
        display: true,
        title: { display: true, text: 'Thời gian' },
      },
      y: {
        display: true,
        title: { display: true, text: 'Giá trị' },
      },
    },
  };

  return (
    <div style={{ height: 400 }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default TelemetryChart;
