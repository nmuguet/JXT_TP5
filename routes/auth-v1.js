const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const config = require('../config.js');

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
router.post('/login', function (req, res, next) {
  let username = req.body.login;
  let password = req.body.password;

  let usersFound = usersModel.getAll().filter((user) => user.login === username);

  /* istanbul ignore else */
  if (username && password) {
    if (usersFound.length === 1 && usersFound[0].password === password) {
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
  }
  else {
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
  if (token.startsWith('bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  /* istanbul ignore else */
  if (token) {
    try {
      jwt.verify(token, config.secret, (err, decoded) => {
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
          next();
        }
      });
    } catch (exc) {
      /* istanbul ignore next */
      res
        .status(400)
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
module.exports = (model) => {
  usersModel = model
  return router
}
