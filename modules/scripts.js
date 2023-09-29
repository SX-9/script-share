const fs = require('fs');
const { verifyPassword, getUserData } = require('./account.js')

module.exports = manager;

function updateUserScripts(username, isPaying, isAdding, scriptLoc) {
    let file = getUserData(isPaying, username);
    if (isAdding) {
        file.scripts.push(scriptLoc);
    } else {
        file.scripts.filter(e => e !== scriptLoc);
    }
}

function isReallyUser(username, password, paying) {
    let { realPass } = getUserData(paying, username);
    return verifyPassword(password, realPass);
}

function manager(app) {
    app.post('/api/scripts', (req, res) => {

    });
    app.delete('/api/scripts', (req, res) => {

    });
}