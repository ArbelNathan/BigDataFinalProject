// This is a "controller"
var MongoClient = require('mongodb').MongoClient;
const express = require('express');
const router = express.Router();
const Json2csvParser = require('json2csv').Parser;
const fs = require('fs');

const dbName = "rest"
const collectionNmae = "calls"

router.get('/specific', (req, res) => {
    res.send('We are on /posts/specific')
})

//SUBMIT A POST
router.post('/', async (req, res) => {
    var resp
    MongoClient.connect(process.env.DB_CONNECTION, function (err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        var myobj = req.body.title;
        console.log(myobj)
        dbo.collection(collectionNmae).insertOne(myobj, function (err, responce) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
            console.log(responce);
            resp = responce
            res.json(resp)
        });
    });

})

exports.publish = function (lock) {
    // Create a connection to the MongoDB database
    lock.acquire('bigml', function (done) {
        console.log('creating new csv');
        MongoClient.connect(process.env.DB_CONNECTION, function (err, db) {
            if (err) throw err;

            let dbo = db.db(dbName);

            dbo.collection(collectionNmae).find({}).toArray(function (err, result) {
                if (err) throw err;
                for (var i = 0; i < result.length; i++){
                    delete result[i]._id;
                    delete result[i].startTime;
                }
                //-> Convert JSON to CSV data
                const csvFields = ['city', 'gender', 'age', 'prevCalls', 'product', 'topic', 'timeInYear']
                const opts = { csvFields };
                const json2csvParser = new Json2csvParser(opts);
                const csv = json2csvParser.parse(result);
                // console.log(csv);

                fs.writeFile('./data/calls.csv', csv, function (err) {
                    if (err) throw err;
                    console.log('new csv saved');
                    done()
                });

                db.close();
            });
        });
    });
};

exports.router = router;