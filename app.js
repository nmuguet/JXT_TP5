const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')

const usersRouter = require('./routes/users-v1')
const authRouter = require('./routes/auth-v1')
const usersModel = require('./model/users')
const authModel = require('./model/idp')


const app = express()

app.use(bodyParser.json())

// Activation de Helmet
app.use(helmet({ noSniff: true }))

// On injecte le model dans les routers. Ceci permet de supprimer la dépendance
// directe entre les routers et le model



app.use((req, res, next) => {
    if (!req.url.includes("/v1/auth/login")) {
        let token = null
        try {
            token = req.headers.authorization.split(" ")[1]
            authModel.checkToken(token).then((err) => {
                if (err) {
                    res
                        .status(401)
                        .json({
                            code: 0,
                            type: 'auth',
                            message: 'Not logged'
                        });
                } else {
                    next()
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
        next()
    }
});

app.use('/v1/users', usersRouter(usersModel))
app.use('/v1/auth', authRouter(authModel, usersModel))


// For unit tests
exports.app = app