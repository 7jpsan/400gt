const aws = require('aws-sdk');
aws.config.region = 'eu-west-1';
var lambda = new aws.Lambda();

async function findActivityId(name, payload){

  var params = {
    FunctionName: name, // the lambda function we are going to invoke
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: payload
  };

  return new Promise((resolve, reject) => {
    
    lambda.invoke(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.Payload);
      }
    })
  });

}

exports.default = findActivityId;