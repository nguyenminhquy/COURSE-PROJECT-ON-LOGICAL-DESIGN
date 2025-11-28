import React from 'react';
import { useGlobal } from '../services/globalContext';

function Header() {
  const { userName, setIsLogined } = useGlobal();
  const initials = (userName || 'U').substring(0, 2).toUpperCase();

  const handleLogout = () => {
    document.cookie = 'tk=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setIsLogined(false);
  };

  const navItems = ['Tổng quan', 'Realtime', 'Phân tích', 'Thiết bị', 'Cảnh báo'];

  return (
    <>
      <header className="sf-header sf-header--hero">
        <div className="sf-logo" title="Smart Farm">
          <div className="sf-logo-badge">SF</div>
          <div>
            <div className="sf-logo-eyebrow">SMART</div>
            <div className="sf-logo-title">FARM</div>
          </div>
        </div>

        <nav className="sf-nav">
          {navItems.map((item) => (
            <a key={item} className="sf-nav-link" href="#!">
              {item}
            </a>
          ))}
        </nav>

        <div className="sf-top-actions">
          <div className="sf-status">
            <span className="sf-dot" />
            <span>Realtime online</span>
          </div>
          <div className="sf-user-pill">
            <div className="sf-avatar">{initials}</div>
            <div className="sf-user-meta">
              <div className="sf-user-label">Người dùng</div>
              <div className="sf-user-name">{userName || 'User'}</div>
            </div>
          </div>
          <button className="sf-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <div style={{ height: 74 }} />
    </>
  );
}

export default Header;
