// src/components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const IconRealtime = () => (
  <svg className="sf-menu-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 20h14a2 2 0 0 0 2-2V9.5A1.5 1.5 0 0 0 19.5 8h-15A1.5 1.5 0 0 0 3 9.5V18a2 2 0 0 0 2 2Zm10-4.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm-5 0A1.25 1.25 0 1 1 7.5 14 1.25 1.25 0 0 1 10 15.25Zm7-7.5V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v1.75Z" />
  </svg>
);

const IconAnalytics = () => (
  <svg className="sf-menu-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 20h2V9H5zm12 0h2V4h-2zm-6 0h2v-6h-2zm-3 0h2V12H8zm9 0h2v-8h-2z" />
  </svg>
);

const IconAI = () => (
  <svg className="sf-menu-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a1 1 0 0 1 .894.553l1.382 2.764 3.05.444a1 1 0 0 1 .554 1.706l-2.206 2.15.521 3.036a1 1 0 0 1-1.451 1.054L12 12.93l-2.744 1.44a1 1 0 0 1-1.451-1.054l.521-3.036-2.206-2.15A1 1 0 0 1 6.67 5.761l3.05-.444 1.382-2.764A1 1 0 0 1 12 2Z" />
  </svg>
);

const menuItems = [
  { key: 'realtime', label: 'Dữ liệu hiện tại', href: '/realtime-data', icon: <IconRealtime /> },
  { key: 'analytics', label: 'Phân tích dữ liệu', href: '/analytics', icon: <IconAnalytics /> },
  { key: 'ai', label: 'AI Dự đoán', href: '/ai', icon: <IconAI /> },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sf-sidebar">
      <div className="sf-menu-title">Bảng điều khiển</div>
      <div className="sf-menu">
        {menuItems.map(({ key, label, href, icon }) => {
          const isActive = location.pathname.startsWith(href);
          return (
            <Link key={key} to={href} className={`sf-menu-item ${isActive ? 'active' : ''}`}>
              {icon}
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;
