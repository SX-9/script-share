const express = require('express');
const cors = require('cors');

const accountManager = require('./account.js');
const rateLimit = require('./limiter.js');

const app = express();

app.use(express.json());
app.use('/raw', cors({
    origin: '*',
    methods: ['GET'],
}));

rateLimit(app);
accountManager(app);

app.use('/raw', express.static('scripts'));

app.listen(8081, () => console.log('online @ port 8081'));