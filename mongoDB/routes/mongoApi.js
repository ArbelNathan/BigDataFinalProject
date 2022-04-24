// This is a "controller"
var MongoClient = require('mongodb').MongoClient;
const express = require('express');
const router = express.Router();
const Json2csvParser = require('json2csv').Parser;
const fs = require('fs');


// //GET BACK ALL THE POSTS
// router.get('/', async (req, res) => {
//     try {
//         const posts = await Post.find();
//         res.json(posts);
//     } catch (err) {
//         res.json({ message: err });
//         console.log(err)
//     }
// })

router.get('/specific', (req, res) => {
    res.send('We are on /posts/specific')
})

//SUBMIT A POST
router.post('/', async (req, res) => {
    var resp
    MongoClient.connect(process.env.DB_CONNECTION, function (err, db) {
        if (err) throw err;
        var dbo = db.db("rest");
        var myobj = req.body.title;
        console.log(myobj)
        dbo.collection("posts").insertOne(myobj, function (err, responce) {
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

            let dbo = db.db("rest");

            dbo.collection("posts").find({}).toArray(function (err, result) {
                if (err) throw err;

                //-> Convert JSON to CSV data
                const csvFields = ['city', 'gender', 'age', 'prevCalls', 'product', 'topic',]
                const json2csvParser = new Json2csvParser({ csvFields });
                const csv = json2csvParser.parse(result);

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

// //GET BACK SPECIFIC POST
// router.get('/:postId', async (req, res) => {
//     try {
//         const posts = await Post.findById(req.params.postId);
//         res.json(posts);
//     } catch (err) {
//         res.json({ message: err });
//         console.log(err)
//     }
// })

// //DELETE SPECIFIC POST
// router.delete('/:postId', async (req, res) => {
//     try {
//         const removedPosts = await Post.remove({ _id: req.params.postId });
//         res.json(removedPosts);
//     } catch (err) {
//         res.json({ message: err });
//         console.log(err)
//     }
// })

// //UPDATE SPECIFIC POST
// router.patch('/:postId', async (req, res) => {
//     try {
//         const removedPosts = await Post.updateOne(
//             { _id: req.params.postId },
//             {
//                 $set: { title: req.body.title }
//             });
//         res.json(removedPosts);
//     } catch (err) {
//         res.json({ message: err });
//         console.log(err)
//     }
// })

exports.router = router;