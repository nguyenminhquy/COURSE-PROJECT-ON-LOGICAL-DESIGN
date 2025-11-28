import React from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaLeaf, FaGlobe, FaUniversity, FaDirections } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="sf-footer">
      <div className="sf-footer__grid">
        <div>
          <div className="sf-logo" style={{ padding: 0, marginBottom: 10 }}>
            <div className="sf-logo-badge">SF</div>
            <div>
              <div className="sf-logo-eyebrow">SMART</div>
              <div className="sf-logo-title">FARM</div>
            </div>
          </div>
          <p className="sf-footer__text">
            Hệ thống IoT giám sát nông trại theo thời gian thực, an toàn và trực quan.
          </p>
          <div className="sf-footer__chips">
            <span className="sf-chip sf-chip--soft"><FaLeaf /> IoT</span>
            <span className="sf-chip sf-chip--soft"><FaGlobe /> Realtime</span>
          </div>
        </div>

        <div>
          <h4 className="sf-footer__heading">Liên hệ</h4>
          <ul className="sf-footer__list">
            <li><FaUniversity /> Đại học Bách Khoa TP.HCM</li>
            <li><FaMapMarkerAlt /> 268 Lý Thường Kiệt, Q.10, TP.HCM</li>
            <li><FaPhoneAlt /> (028) 3864 7256</li>
            <li><FaEnvelope /> info@hcmut.edu.vn</li>
          </ul>
        </div>

        <div>
          <h4 className="sf-footer__heading">Tài liệu</h4>
          <ul className="sf-footer__list">
            <li><FaGlobe /> API Docs</li>
            <li><FaDirections /> Bản đồ đường đi</li>
          </ul>
        </div>
      </div>
      <div className="sf-footer__bottom">
        <span>© {new Date().getFullYear()} SmartFarm</span>
        <span>Realtime • Secure • Insightful</span>
      </div>
    </footer>
  );
};

export default Footer;
