const aws = require('aws-sdk');
const uuid = require('uuid');

// Create DynamoDB service object
var ddb = new aws.DynamoDB({apiVersion: '2012-08-10'});

async function addToDynamo(params){
    return new Promise((resolve, reject) => {
        ddb.putItem(params, function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
    });
}

exports.handler = async (event) => {
    
    // It is a top level assets folder
    try {
        const activityUUID = uuid.v4();
        var params = {
          TableName: process.env["activity_table"],
          Item: {
            'name' : {S: event.name},
            'url' : {S: event.url},
            'id': {S: activityUUID},
            'event_count': {N: '0'}
          }
        };
        const dbDataItem = await addToDynamo(params);
        return activityUUID;
    } catch (err) {
        console.log(err);
        const message = `Could not save data to the table`;
        console.log(message);
        throw new Error(message);
    }
};