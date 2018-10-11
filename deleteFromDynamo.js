var AWS = require("aws-sdk");
AWS.config.update({ region: "eu-west-1" });
var docClient = new AWS.DynamoDB.DocumentClient();

async function deleteDynamo(params) {
  return new Promise((resolve, reject) => {
    docClient.delete(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

exports.default = deleteDynamo;