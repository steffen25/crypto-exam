// Dependencies
var express = require('express');
const BodyParser = require('body-parser');
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
app = express();
app.use(BodyParser.urlencoded({
    extended: true
}));
app.use(BodyParser.json());

var database;

// Connection URL
var url = 'mongodb://localhost:27017/cryptoexam';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    if (err) {
        console.log('An error occured while connecting to the database')
    } else {
        console.log("Connected correctly to server");
        database = db
    }
    //db.close();
});




app.post('/user/', function (req, res) {

    var user = req.body;

    var collection = database.collection('users');

    collection.insertOne( user, function(err, result) {
        if (err) {
            return res.json({error: "Failure"})
        } else {
            return res.json({success:"Inserted user into DB", user: user})
        }
    });

})











app.listen(process.env.PORT || 4000);

