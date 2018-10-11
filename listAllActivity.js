// Load the AWS SDK for Node.js
var scanTable = require("scanTable").default;
var queryTable = require("queryTable").default;

exports.handler = async (event, context, callback) => {
  const { path, queryStringParameters, headers, body } = event;
  var params = {
    ExpressionAttributeValues: {
        ":username": queryStringParameters['username']
    },
    FilterExpression: "#user = :username",
    ExpressionAttributeNames: {
     "#user": "user","#start": "start","#end": "end"
      
   },
   ProjectionExpression: "#user, activity_name, #start, #end, score",
    TableName: '400gt_eventParticipant'
   };
   
   const results = await scanTable(params);
   const resultItems = {"activities": results.Items};
   
   console.log(resultItems)
   
    // create a response
    const response = {
        statusCode: 200,
        body: JSON.stringify(resultItems),
    };
    callback(null, response);
    return;
};
