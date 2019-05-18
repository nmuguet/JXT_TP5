const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const config = require('../config.js');
const bcrypt = require('bcrypt');

let usersModel = undefined



/* Control usermodel initialisation */
router.use((req, res, next) => {
    /* istanbul ignore if */
    if (!usersModel) {
        res
            .status(500)
            .json({ message: 'model not initialised' })
    }
    next()
})


/* POST to login and get a token */
router.post('/login', async (req, res, next) => {
    let username = req.body.login;
    let password = req.body.password;

    let usersFound = usersModel.getAll().filter((user) => user.login === username);

    /* istanbul ignore else */
    if (username && password) {
        let goodPassword = await bcrypt.compare(password, usersFound[0].password)
        if (usersFound.length === 1 && goodPassword) {
            let exp = Math.floor(Date.now() / 1000) + (60 * 60); // exp in 1h
            let token = jwt.sign({ exp: exp, username: username }, config.secret);
            res
                .status(200)
                .json({
                    access_token: token,
                    expirity: exp
                });
        } else {
            res
                .status(401)
                .json({
                    code: 0,
                    type: "error",
                    message: 'Incorrect username or password',
                });
        }
    } else {
        res
            .status(401)
            .json({
                code: 0,
                type: "error",
                message: 'Wrong parameters' + req.body.json
            })
    }
})

/* GET to check access */
router.get('/verifyaccess', function (req, res, next) {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token !== "undefined") {
        if (token.startsWith('bearer ')) {
            // Remove bearer from string
            token = token.slice(7, token.length);
        }
        /* istanbul ignore else */
        try {
            authModel.checkToken(token).then((err) => {
                if (err) {
                    res
                        .status(401)
                        .json({
                            code: 0,
                            type: 'error',
                            message: 'Token is not valid'
                        });
                } else {
                    res
                        .status(200)
                        .json({
                            message: 'Token validated'
                        })
                }
            });
        } catch (exc) {
            /* istanbul ignore next */
            res
                .status(401)
                .json({
                    code: 0,
                    type: 'error verify access',
                    message: exc.message
                })
        }
    } else {
        res
            .status(400)
            .json({ message: 'Auth token is not supplied' })
    }
})


/** return a closure to initialize model */
module.exports = (model1, model2) => {
    authModel = model1
    usersModel = model2
    return router
}