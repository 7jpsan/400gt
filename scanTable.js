// Load the AWS SDK for Node.js
var aws = require('aws-sdk');

// Set the region 
aws.config.update({region: 'eu-west-1'});

// Create DynamoDB service object
var ddb = new aws.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

async function scanTable(params){
  return new Promise((resolve, reject) => {
      ddb.scan(params, (err, data) => {
         if(err){
             reject(err);
         }
         resolve(data);
    });
  });
}

exports.default = scanTable;