import React, { useMemo } from 'react';

const toneMap = {
  low: { from: 'rgba(14, 165, 233, 0.28)', to: 'rgba(14, 165, 233, 0.14)' },
  medium: { from: 'rgba(234, 179, 8, 0.26)', to: 'rgba(234, 179, 8, 0.12)' },
  high: { from: 'rgba(239, 68, 68, 0.28)', to: 'rgba(239, 68, 68, 0.12)' },
  on: { from: 'rgba(34, 197, 94, 0.3)', to: 'rgba(34, 197, 94, 0.14)' },
  off: { from: 'rgba(239, 68, 68, 0.28)', to: 'rgba(239, 68, 68, 0.12)' },
};

const statusClass = (status) => {
  if (!status) return '';
  const label = status.toLowerCase();
  if (label.includes('thấp')) return 'status-low';
  if (label.includes('trung')) return 'status-medium';
  if (label.includes('cao')) return 'status-high';
  if (label.includes('bật') || label.includes('on')) return 'status-on';
  if (label.includes('tắt') || label.includes('off')) return 'status-off';
  return '';
};

const toneByStatus = (status) => {
  const label = status?.toLowerCase() || '';
  if (label.includes('thấp')) return toneMap.low;
  if (label.includes('trung')) return toneMap.medium;
  if (label.includes('cao')) return toneMap.high;
  if (label.includes('bật') || label.includes('on')) return toneMap.on;
  if (label.includes('tắt') || label.includes('off')) return toneMap.off;
  return { from: 'rgba(255,255,255,0.08)', to: 'rgba(255,255,255,0.04)' };
};

const SensorCard = ({ icon, title, value, unit, status }) => {
  const tone = useMemo(() => toneByStatus(status), [status]);
  const classStatus = statusClass(status);

  return (
    <div
      className="sensor-card"
      style={{
        background: `linear-gradient(135deg, ${tone.from} 0%, ${tone.to} 100%)`,
      }}
    >
      <div className="sensor-icon-wrap">{icon}</div>
      <div className="sensor-body">
        <h3 className="sensor-title">{title}</h3>
        <p className="sensor-value">
          {value} <span className="sensor-unit">{unit}</span>
        </p>
        <span className={`sensor-status ${classStatus}`}>Tình trạng: {status}</span>
      </div>
    </div>
  );
};

export default SensorCard;
