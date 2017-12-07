// Dependencies
const express = require('express');
require('dotenv').config()
const fs = require('fs');
const BodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient
const bcrypt = require('bcrypt');
const verifyToken = require('./verifytoken');
var jwt = require('jsonwebtoken');
const saltRounds = 10;
app = express();
app.use(BodyParser.urlencoded({
    extended: true
}));
app.use(BodyParser.json());

var database;

// --------------------------------
// Setup connection to databse
// --------------------------------

var dbUser = process.env.DB_USER;
var dbPw = process.env.DB_PASS;

var url = 'mongodb://' + dbUser + ':' + dbPw + '@ds129926.mlab.com:29926/cryptoexam';
//var url = 'mongodb://localhost:27017/cryptoexam';
MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('An error occured while connecting to the database')
    } else {
        console.log("Connected correctly to server");
        database = db
    }
});


// ----------------------------------------------------------------
//                  CREATE USER ENDPOINT
// ----------------------------------------------------------------

app.post('/user', function (req, res) {

    // Create variable containing body from request (user information)
    var user = req.body;

    // Create reference to the users correction in the database.
    var collection = database.collection('users');

    // Generate salt to be used in hash function.
    bcrypt.genSalt(saltRounds, function (err, salt) {

        console.log(salt)

        // Hash users password using generated salt.
        bcrypt.hash(user.password, salt, function (err, hash) {

            // Assign user password to generated hash - Key deriviation function.
            user.password = hash;

            // Insert user document into database
            collection.insertOne(user, function (err, result) {
                if (err) {
                    return res.json({ error: "Internal failure", error: err })
                }

                user.password = undefined;
                return res.json({ success: "Inserted user into DB", user: user })
            });
        });
    });
})

// ----------------------------------------------------------------
//                  LOGIN ENDPOINT
// ----------------------------------------------------------------

app.post('/login', function (req, res) {

    var email = req.body.email;
    var password = req.body.password;

    var collection = database.collection('users');


    collection.findOne({ email: email }, function (err, user) {
        if (err) {
            return callback(err, null);
        }

        // Email not found - for security reason response is same as when password is not right
        if (!user) {
            return res.json({ error: "No user found", error: err })
        }

        // hashing
        bcrypt.compare(password, user.password, function (err, matches) {

            if (!err && matches) {

                var privateKey = fs.readFileSync('./api.rsa')
                // if user is found and password is right create a token

                user.password = undefined;
                user.exp = Math.floor(Date.now() / 1000) + (60 * 60)

                // signing
                var token = jwt.sign(user, privateKey, { algorithm: "RS256" }, function (err, token) {

                    // return the information including token as JSON
                    var data = {
                        token: token,
                        user: user
                    }
                    return res.json({ data: data })
                });
            } else {
                return res.json({ error: err })
            }
        });
    });
})

// ----------------------------------------------------------------
//              EDIT USERNAME ENDPOINT
// ----------------------------------------------------------------

app.put('/user', verifyToken, function (req, res) {

    // Payload from token middleware
    var user = req.user;

    // Mongo DB collection
    var collection = database.collection('users');

    // Grab value to update
    var firstName = req.body.firstName;

    // If JWT is verified - find user to modify by looking up email.
    collection.findOne({ email: user.email }, function (err, user) {
        if (err) {
            return res.status(500).json({ error: err });
        }

        // Could not find user by the email in the token
        if (!user) {
            return res.status(404).json({ error: "User could not be found" });
        }

        // Update user by
        collection.update({ _id: user._id },
            {
                $set:
                    {
                        firstName: firstName
                    }
            }, function (err, updatedUser) {
                if (err) {
                    return res.status(500).json({ error: err });
                }

                return res.status(200).json({ success: true });
            }
        )


    });


})

app.listen(process.env.PORT || 4000);

