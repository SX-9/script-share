const { rateLimit } = require('express-rate-limit');

module.exports = limiter;

function limiter(app) {
    app.use('/api/script', rateLimit({
        windowMs: 60 * 60 * 1000,
        limit: 7,
        message: ['Rate Limited, Please wait for 1 hour'],
    }));

    app.use('/raw/f', rateLimit({
        windowMs: 30 * 60 * 1000,
        limit: 50,
        message: ['Rate Limit Is 50 Requests / 30 Minutes In The Free Plan'],
    }));

    app.use('/raw/p', rateLimit({
        windowMs: 30 * 60 * 1000,
        limit: 150,
        message: ['Rate Limit Is 150 Requests / 30 Minutes In The Paid Plan'],
    }));
}