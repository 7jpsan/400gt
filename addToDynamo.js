const aws = require('aws-sdk');
aws.config.region = 'eu-west-1';

// Create DynamoDB service object
var ddb = new aws.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

async function updateDynamo(params){
  return new Promise((resolve, reject) => {
      ddb.update(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
  });
}

exports.default = updateDynamo;
