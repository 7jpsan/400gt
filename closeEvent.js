// Load the AWS SDK for Node.js
var scanTable = require("./scanTable").default;
var saveToDynamo = require('./addToDynamo').default;
var sendHttp = require('./sendHttp').default;

var aws = require('aws-sdk');
aws.config.region = 'eu-west-1';

var lambda = new aws.Lambda();


async function calculatePoints(eventId){

  var params = {
    FunctionName: "400gt_pointsCalculator", // the lambda function we are going to invoke
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: `{"eventId": "${eventId}"}`
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

async function alertBotEndActivity(){
  return sendHttp('bkswz8idxa.execute-api.eu-west-1.amazonaws.com', 'POST', '/prod/event-end', '{}');
}

async function findEventsToClose(){
  var params = {
    ExpressionAttributeValues: {
     ":now": `${Date.now()}`,
     ":minParticipants": 1
    },
    FilterExpression: "#end < :now AND attribute_not_exists(closed) AND participants >= :minParticipants",
    ExpressionAttributeNames: {
     "#end": "end",
   },
   ProjectionExpression: "id, #end, activity_id",
    TableName: process.env["event_table"]
   };
   
   const results = await scanTable(params);   
   return results.Items;
}

async function closeEvent(event){
  var events = await findEventsToClose();

  for(let eventObj of events){
    const result =  await calculatePoints(eventObj.id);

    var params = {
      TableName: process.env["event_table"],
      Key: { id: eventObj.id},
      UpdateExpression: "set closed = :closed",
      ExpressionAttributeValues: {
        ":closed": true
      }
    };
    await saveToDynamo(params);
    const postBot = await alertBotEndActivity();
    console.log(postBot);
  }

  return events;
};

exports.handler = closeEvent;