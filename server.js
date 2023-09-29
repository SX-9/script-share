const express = require('express');
const cors = require('cors');

const { manager: accountManager } = require('./modules/account.js');
const rateLimit = require('./modules/limiter.js');
const scriptManager = require('./modules/scripts.js');

const app = express();

app.use(express.json());
app.use('/raw', cors({
    origin: '*',
    methods: ['GET'],
}));

rateLimit(app);
accountManager(app);
scriptManager(app);


app.use('/raw', express.static('scripts'));

app.listen(8081, () => console.log('online @ port 8081'));