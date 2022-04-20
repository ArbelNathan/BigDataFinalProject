var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var redis = require('redis');
var redisClient = redis.createClient();
var sub = redis.createClient()
var save_section;

var AsyncLock = require('async-lock');
var lock = new AsyncLock();


function operation(id,last_section,next_section,Exit_from_road) {  //RT dashboard- button details
  lock.acquire(id, function(done) {
      setTimeout(function() {
          update_file_sections(last_section,next_section,Exit_from_road)
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


update_file_sections=function(last_section,next_section,Exit_from_road){
    const fs2 = require('fs');
    var save2;
    fs2.readFile('./data/Cars_Sections.json', 'utf-8', (err, data) => {
        if (err) {
            throw err;
        }
        save2=JSON.parse(data.toString()); 
        var1=parseInt(save2.one);var2=parseInt(save2.two);var3=parseInt(save2.three);var4=parseInt(save2.four);var5=parseInt(save2.five);var6=parseInt(save2.six);
        console.log(var1+","+var2+","+var3+","+var4+","+var5+","+var6)

        if(next_section!=Exit_from_road){

        switch (parseInt(next_section)) {
            case 1:var1++;break;
            case 2:var2++;break;
            case 3:var3++;break;
            case 4:var4++;break;
            case 5:var5++;break;
            case 6:var6++;break;
            default: break;
              
          }
        }
          switch (parseInt(last_section)) {
            case 1:var1--;break;
            case 2:var2--;break;
            case 3:var3--;break;
            case 4:var4--;break;
            case 5:var5--;break;
            case 6:var6--;break;
            default: break;
              
          }
          console.log(var1+","+var2+","+var3+","+var4+","+var5+","+var6)
        const fs3 = require('fs');
        const cars = {"one": var1,"two": var2,"three": var3,"four": var4,"five": var5,"six": var6 };
        const data3 = JSON.stringify(cars);
        fs3.writeFile('./data/Cars_Sections.json', data3, (err) => {
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
                job['Id_car']=key;
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
               fs3.writeFile('./data/car_details.json', data3, (err) => {
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

 