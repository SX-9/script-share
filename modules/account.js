const fs = require('fs');
const bcrypt = require('bcryptjs');

module.exports = {
    manager,
    verifyPassword, getUserData
};

async function hashPassword(plaintextPassword, saltRounds) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(plaintextPassword, salt);
    return hash;
}

async function verifyPassword(enteredPassword, hashedPassword) {
    const isMatch = await bcrypt.compare(enteredPassword, hashedPassword);
    return isMatch;
}

function getUserData(isPaying, username) {
    let isPaid = (req.body.premiumCode && isValidCode) ? 'premium' : 'free';
    let path ='./accounts/' + isPaid + '/' + username + '.json';
    return JSON.parse(fs.readFileSync(path));
}

function manager(app) {
    app.post('/api/account', async (req, res) => {
        if (!req.body) return res.status(400).json({
            message: 'No Data Provided',
        });

        let keys = Object.keys(req.body)
        if (!keys.includes('username') || !keys.includes('password')) return res.status(400).json({
            message: 'Insufficient Information',
            info: 'Require A Username And Password',
        });
        
        let isValidCode = 0;
        if (req.body.premiumCode) {
            let today = Date.now() / 1000;
            let validCodes = JSON.parse(fs.readFileSync('./accounts/premium-codes.json'));
            for (validCode of validCodes) {
                if (req.body.premiumCode === validCode.code && validCode.expireAt > today) {
                    isValidCode++; break;
                }
            }
            if (!isValidCode) return res.status(402).json({
                message: "Invalid Code.",
            });
        }
        let isPaid = (req.body.premiumCode && isValidCode) ? 'premium' : 'free';
        
        if (req.body.username.length >= 20) return res.status().json({
            message: "Invalid Username.",
            info: "Max 20 Characters, Got " + req.body.username.length + ".",
        });
        
        let invalidChars = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/;
        if (!invalidChars.test(req.body.username)) return res.status(409).json({
            message: "Invalid Username.",
            info: "Not Allowed Characters: . / \\ : * ? [ ] ' \" < > | $ & ; ( )",
        });

        if (req.body.password.length < 8) return res.status(409).json({
            message: "Invalid Password.",
            info : "Min 8 Characters, Got " + req.body.password.length + ".",
        });

        if (!fs.existsSync('./accounts/' + isPaid + '/' + req.body.username + '.json')) {
            fs.writeFileSync('./accounts/' + isPaid + '/' + req.body?.username + '.json', JSON.stringify({
                username: req.body?.username,
                password: await hashPassword(req.body.password, 10),
                scripts: [],
            }));
            res.status(201).json({
                message: 'Created',
                info: 'Welcome ' + req.body.username + '!',
            });
        } else {
            res.status(409).json({
                message: 'Invalid Username.',
                info: `Username ${req.body.username} Already Exists.`,
            });
        }
    });

    app.delete('/api/account', async (req, res) => {
        if (!req.body) return res.status(400).json({
            message: 'No Data Provided',
        });

        let keys = Object.keys(req.body)
        if (!keys.includes('username') || !keys.includes('password') || !keys.includes('isPaying')) return res.status(400).json({
            message: 'Insufficient Information',
            info: 'Require Is Paying?, A Username, And Password',
        });

        let isPaying = req.body.isPaying ? 'premium' : 'free';

        let path = './accounts/' + isPaying + '/' + req.body.username + '.json';
        if (!fs.existsSync(path)) return res.status(404).json({
            message: 'Invalid Username.',
            info: `Username ${req.body.username} Doesn't Exists.`,
        });
        let file = JSON.parse(fs.readFileSync(path));

        if (verifyPassword(req.body.password, file.password)) {
            fs.unlinkSync(path);
            res.status(200).json({
                message: 'Deleted',
                info: `${file.username}'s Account Deleted.`,
            });
        }
    });
}