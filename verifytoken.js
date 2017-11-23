const fs = require('fs');
var jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    // verify a token asymmetric
    var token = req.headers['authorization']
    var publicKey = fs.readFileSync('api.rsa.pub');  // get public key
    jwt.verify(token, publicKey, function(err, payload) {
        if (err) {
            return res.status(401).json({error: "Invalid token"})
        }
        req.user = payload;
        next();
    });
}

module.exports = verifyToken