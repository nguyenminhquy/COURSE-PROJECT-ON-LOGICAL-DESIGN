COURSE-PROJECT-ON-LOGICAL-DESIGN
Ứng dụng SmartFarm (frontend React + backend Express) giám sát và phân tích dữ liệu cảm biến, AI dự đoán ngắn hạn và tư vấn canh tác.

1. Yêu cầu
Node.js 18+ (backend đang đặt engines 22, khuyến nghị Node 20/22).
npm.
Có token/device CoreIoT để gọi API (khai báo trong .env backend).
Không commit .env và serviceAccountKey.json.
2. Cấu trúc chính
Embedded-frontend-main/: React app (CRA).
embedded-backend-main/: Backend Express trong Firebase Functions wrapper.
PYTHON/: script Python (tùy nhu cầu).
3. Thiết lập & chạy Backend
cd embedded-backend-main
npm install
Tạo file .env (không commit) với nội dung ví dụ:

COREIOT_BASE=https://app.coreiot.io/api
COREIOT_TOKEN=Bearer_xxx
COREIOT_DEVICE_ID=your_device_id
SERVER_URL=http://localhost:3500
PORT=3500
Chạy server Express:

node server.js
Backend phục vụ tại http://localhost:3500 với các API:

POST /api/login (demo user1/password1; trả JWT)
GET /api/data/realtime
GET /api/data/history
GET /api/data/predict (hồi quy tuyến tính 60 phút tới)
GET /api/data/advisory (tư vấn rule-based)
4. Thiết lập & chạy Frontend
cd Embedded-frontend-main
npm install
Tạo file .env (không commit):

REACT_APP_API_URL=http://localhost:3500
Chạy dev server:

npm start
Frontend chạy tại http://localhost:3000.

5. Đăng nhập
Trang /login, nhập user1 / password1 (demo).
JWT được lưu cookie tk để gọi API.
6. Các trang chính
Dữ liệu hiện tại: realtime cảm biến (nhiệt độ, độ ẩm, soil moisture, rainfall, water level) và trạng thái thiết bị (fan speed, LED, pump).
Phân tích dữ liệu: chọn 24h/1w/1m/3m, KPI hiện tại, biểu đồ xu hướng, nước & mưa, tốc độ quạt, trung bình cảm biến; AI dự đoán 60 phút.
AI Dự đoán: thẻ dự báo 60 phút tới cho từng cảm biến, icon cảm biến; tư vấn nông nghiệp từ /api/data/advisory.
7. Ghi chú bảo mật
Không commit .env, config/serviceAccountKey.json, node_modules.
Token/CoreIoT và key Firebase phải được rotate nếu đã lộ.
.gitignore đã được bổ sung để bỏ qua các file nhạy cảm.
