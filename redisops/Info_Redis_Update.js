var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var redis = require('redis');
var redisClient = redis.createClient();
var sub = redis.createClient()
var save_section;

//waiting for client
//await redisClient.connect()
//await sub.connect()

var AsyncLock = require('async-lock');
var lock = new AsyncLock();


function operation(id,last_section,next_section,cEnd) {  //RT dashboard- button details
  lock.acquire(id, function(done) {
      setTimeout(function() {
          update_file_sections(last_section,next_section,cEnd)
          done();
      }, 3000)
  }, function(err, ret) {
  }, {});
}


function operation2(id,prediction,out_section){   //RT dashboard-table
var array; 
  lock.acquire(id, function(done) {
      setTimeout(function() {
        const fs2 = require('fs');
        fs2.readFile('./data/dashboard_table.json', 'utf-8', (err, data) => {
            if (err) {
                throw err;
            }
            save2=JSON.parse(data.toString()); 
            save2.array[(out_section-1)*6+prediction-1]=save2.array[(out_section-1)*6+prediction-1] +1;         
            const fs3 = require('fs');
            fs3.writeFile('./data/dashboard_table.json',  JSON.stringify(save2), (err) => {
                if (err) {
                    throw err;
                }
                console.log("JSON data is saved.");
            });
    
          });
       
          done();
      }, 3000)
  }, function(err, ret) {
  }, {});
  
}


update_file_sections=function(last_section,next_section,cEnd){
    const fs2 = require('fs');
    var save2;
    fs2.readFile('./data/Calls_Sections.json', 'utf-8', (err, data) => {
        if (err) {
            throw err;
        }
        save2=JSON.parse(data.toString()); 
        call1=parseInt(save2.one);call2=parseInt(save2.two);call3=parseInt(save2.three);call4=parseInt(save2.four);call5=parseInt(save2.five);call6=parseInt(save2.six);
        console.log(call1+","+call2+","+call3+","+call4+","+call5+","+call6)

        if(next_section!=cEnd){

        switch (parseInt(next_section)) {
            case 1:call1++;break;
            case 2:call2++;break;
            case 3:call3++;break;
            case 4:call4++;break;
            case 5:call5++;break;
            case 6:call6++;break;
            default: break;
              
          }
        }
          switch (parseInt(last_section)) {
            case 1:call1--;break;
            case 2:call2--;break;
            case 3:call3--;break;
            case 4:call4--;break;
            case 5:call5--;break;
            case 6:call6--;break;
            default: break;
              
          }
          console.log(call1+","+call2+","+call3+","+call4+","+call5+","+call6)
        const fs3 = require('fs');
        const calls = {"one": call1,"two": call2,"three": call3,"four": call4,"five": call5,"six": call6 };
        const data3 = JSON.stringify(calls);
        fs3.writeFile('./data/Calls_Sections.json', data3, (err) => {
            if (err) {
                throw err;
            }
            console.log("JSON data is saved.");
        });

      });

}

function update(){
  var async = require("async");
  redisClient.keys('*', function (err, keys) {
    if (err) return console.log(err);
    if(keys){
        async.map(keys, function(key, cb) {  //pull out key&value from Redis
            redisClient.get(key, function (error, value) {
                if (error) return cb(error);
                var job = {};
                job['Id']=key;
                job['data']=value;
                cb(null, job);
            }); 
        }, function (error, results) {
           if (error) return console.log(error);
               for(let i=0; i<results.length;i++){
               car=JSON.parse(results[i].data)
               save_section=car.current_section;
               if(car.direction==-1) {car.current_section--;}
               else {car.current_section++;}
               redisClient.set(results[i].Id_car, JSON.stringify(car))
               if(car.current_section==car.Exit_from_road){  //out of road
                redisClient.del(results[i].Id_car)   //erase from Redis
                operation2('key1',car.my_prediction,car.Exit_from_road); //RT dashboard-table
               }
           
               operation('key1',save_section,car.current_section,car.Exit_from_road) //RT button details
               const fs3 = require('fs');
               const data3 = JSON.stringify(results);
               fs3.writeFile('./data/call_details.json', data3, (err) => {
                  if (err) {
                    throw err;
                }
               console.log("JSON data is saved.");
            });
           }
           
        });
    }
});
}




let i = 1;
setInterval(function() {
  update();}, 30000);

 