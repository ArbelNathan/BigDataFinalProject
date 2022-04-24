const bigml = require('bigml');
const connection = new bigml.BigML('arbelnathan0', 'a8d56b19baf34c0a04933f63c25e889cdd730255');
connection.project = 'project/61af6abc8be2aa18880062a3'
const source = new bigml.Source(connection);
const fs = require('fs');
const CSVPath = "./data/calls.csv"
const modelInfoPath = "./data/modelInfo.json"
const createModelFromCSV = (lock) => {
  lock.acquire('bigml', function (done) {
    console.log("creating a new model.");
    source.create(CSVPath, function (error, sourceInfo) {
      if (!error && sourceInfo) {
        var dataset = new bigml.Dataset(connection);
        dataset.create(sourceInfo, function (error, datasetInfo) {
          if (!error && datasetInfo) {
            var model = new bigml.Model(connection);
            model.create(datasetInfo, function (error, modelInfo) {
              if (!error && modelInfo) {
                const user = {
                  "modelInfo_resource": modelInfo.resource,
                };
                const data = JSON.stringify(user);

                // write JSON string to a file
                fs.writeFile(modelInfoPath, data, (err) => {
                  if (err) {
                    throw err;
                  }
                  console.log("creating a new model is done.");
                  done()
                });
              }
            });
          }
        });
      }
    });
  });
};

const createPredictionFromModel = (perdictionVars,lock) => {
  lock.acquire('bigml', function (done) {
    console.log("creating a new prediction.");
    fs.readFile(modelInfoPath, 'utf-8', (err, data) => {
      if (err) {
        throw err;
      }
      const user = JSON.parse(data.toString());
      var localModel = new bigml.LocalModel(user.modelInfo_resource, connection);
      localModel.predict(perdictionVars,
        function (error, prediction) {
          if (!error && prediction) {
            console.log(prediction);

            const data = JSON.stringify(prediction);
            fs.writeFile('./data/prediction.json', data, (err) => {
              if (err) {
                throw err;
              }
              console.log("finished prediction.");
              done()
            });
          }
        });
    })
  });
};


exports.createModelFromCSV = createModelFromCSV;
exports.createPredictionFromModel = createPredictionFromModel;
