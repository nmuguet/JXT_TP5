const config = require('../config.js');
const jwt = require('jsonwebtoken');

const checkToken = (token) => {
    if (token !== "undefined"){
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.secret, (err) => {
            if (err) {
                reject()
            }
            else {
                console.log("OK ")
                resolve()
            }
        })
    })
    }
    else{
        throw new Error('Auth token is not supplied')
    }
}

exports.checkToken = checkToken