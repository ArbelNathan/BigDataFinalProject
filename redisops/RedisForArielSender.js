var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var redis = require('redis');
var redisClient = redis.createClient();
var sub = redis.createClient()
var async = require("async");
// for explanations : https://www.sitepoint.com/using-redis-node-js/

app.get('/test', function (req, res) {

    // Store string  
    redisClient.set('NumberOfCalls', "390", function (err, reply) {
        console.log(reply);
    });

    //Store and get Hash i.e. object( as keyvalue pairs)
    redisClient.hmset('Sections',"one", 'Sorek',"two", 'Nesharim',"three", 'BenShemen', "four",'nashonim',"five", 'kesem');
    redisClient.hgetall('Sections', function (err, object) {
        console.log(object);
    });
    /*
    also ok:
    redisClient.hmset('Sections', {
                        'javascript': 'AngularJS',
                        'css': 'Bootstrap',
                        'node': 'Express'
                        });
    */

// lists : rpush or lpush
/* client.rpush(['frameworks', 'angularjs', 'backbone'], function(err, reply) {
    console.log(reply); //prints 2
});

// -1= get all
client.lrange('frameworks', 0, -1, function(err, reply) {
    console.log(reply); // ['angularjs', 'backbone']
}); */
   var see="{\"name\":\"call1\",\"color\":\"black\"}";
    redisClient.publish("message", "{\"message\":\"Hello from Redis\"}", function () {
    });

    res.send('Communicated with redis...')
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
//timeperiod,hour,city,gender,age,monthlyNumOfCalls,Product,Subject
sendredis= function(m){   //13/7- message from kafka (this function we activated from kafkaconsume code)
    // we still need to take only part of message to redis.
    //make it a car, and then take stuff out
    const myObj=JSON.parse(m)
    currentsection = myObj["current section"];
    time_period = myObj["time_period"];
    call_hour = myObj["call_hour"];
    city = myObj["city"];
    gender = myObj["gender"];
    age = myObj["age"];
    monthly_num_of_calls = myObj["monthly amount of calls"];
    product_discussed = myObj["product discussed"]
    call_subject = myObj["call subject"]

    const Redis = {
       "currentsection": currentsection,
        "time_period": time_period,
        "call_hour": call_hour,
        "city": city,
        "gender": gender,
        "age": age,
        "monthly_num_of_calls": monthly_num_of_calls,
        "product_discussed": product_discussed,
        "call_subject": call_subject
       };
    
    redisClient.set(number_id.toString(), JSON.stringify(Redis));
    redisClient.publish("message", JSON.stringify(Redis), function () {
    });
    
}


redisClient.on('connect', function () {
    console.log('Sender connected to Redis');
});
server.listen(6062, function () {
    console.log('Sender is running on port 6062');
});

