var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var redis = require('redis');
var redisClient = redis.createClient();
var sub = redis.createClient()

var server = require('http').createServer(app);
const io = require("socket.io")(server)
const port = 8000

redisClient.subscribe('message'); 

app.get('/', (req, res) => res.send('Hello World!'))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var call1,call2,call3,call4,call5,call6;

redisClient.on("message", function (channel, data) {
    var data = JSON.parse(data);
    currentsection = data["current section"];
   const Current_section={
       "section":currentsection
   };

   const fs = require('fs');
   var saver;
   fs2.readFile('./data/Cars_Sections.json', 'utf-8', (err, data) => {
    if (err) {
        throw err;
    }
    saver=JSON.parse(data.toString()); 
    call1=parseInt(saver.one);call2=parseInt(saver.two);call3=parseInt(saver.three);call4=parseInt(saver.four);call5=parseInt(saver.five);call6=parseInt(saver.six);
    switch (parseInt(currentsection)) {
        case 1:call1++;break;
        case 2:call2++;break;
        case 3:call3++;break;
        case 4:call4++;break;
        case 5:call5++;break;
        case 6:call6++;break;
        default: break;
          
      }
      const fs2 = require('fs');
        const calls = {"one": call1,"two": call2,"three": call3,"four": call4,"five": call5,"six": call6 };
        const data2 = JSON.stringify(calls);
        fs2.writeFile('./data/Cars_Sections.json', data2, (err) => {
            if (err) {
                throw err;
            }
            console.log("JSON data is saved from reciver.");
            // try to activate ejs
        });

      });

});

redisClient.on('connect', function() {
    console.log('Reciver connected to Redis');
});


server.listen(6061, function() {
    console.log('reciver is running on port 6061');
});

