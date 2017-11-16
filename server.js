// Dependencies
const express = require('express');
const BodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient
const bcrypt = require('bcrypt');
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
var url = 'mongodb://localhost:27017/cryptoexam';
MongoClient.connect(url, function(err, db) {
    if (err) {
        console.log('An error occured while connecting to the database')
    } else {
        console.log("Connected correctly to server");
        database = db
    }
});


// --------------------------------
// CREATE USER
// --------------------------------

app.post('/user/', function (req, res) {

    // Create variable containing body from request (user information)
    var user = req.body;

    // Create reference to the users correction in the database.
    var collection = database.collection('users');

    // Generate salt to be used in hash function.
    bcrypt.genSalt(saltRounds, function(err, salt) {

        // Hash users password using generated salt.
        bcrypt.hash(user.password, salt, function(err, hash) {

            // Assign user password to generated hash - Key deriviation function.
            user.password = hash;

            // Insert user document into database
            collection.insertOne( user, function(err, result) {
                if (err) {
                    return res.json({error: "Internal failure", error: err})
                } else {
                    user.password = undefined;
                    return res.json({success:"Inserted user into DB", user: user})
                    db.close();
                }
            });
        });
    });
})

// --------------------------------
// LOGIN
// --------------------------------

app.post('/login/', function (req, res) {

})


app.listen(process.env.PORT || 4000);

