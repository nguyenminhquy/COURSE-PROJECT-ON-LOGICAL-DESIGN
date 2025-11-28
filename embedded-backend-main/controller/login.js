const jwt = require('jsonwebtoken');
const { successResponse, errorResponse } = require('../asset/response')

const login = (app) => {
    const users = [
        { id: 1, username: 'user1', password: 'password1' },
        { id: 2, username: 'user2', password: 'password2' }
    ];

    app.post('/api/login', (req, res) => {
        const { username, password } = req.body || {};
        if (!username || !password) {
            return errorResponse(res, 'Tên người dùng hoặc mật khẩu đang thiếu', 400)
        }

        const user = users.find(u => u.username === username && u.password === password);

        if (!user) {
            return errorResponse(res, 'Tên người dùng hoặc mật khẩu không đúng', 400)
        }

        const token = jwt.sign({ username: user.username }, "your_secret_key", { expiresIn: '1h' });
        return successResponse(res, token, 'Đăng  nhập thành công', 200)
    });
}

module.exports = login;