// Load the AWS SDK for Node.js
var scanTable = require("scanTable").default;
var queryTable = require("queryTable").default;

exports.handler = async (event) => {
  var params = {
    ExpressionAttributeValues: {
     ":now": `${Date.now()}`
    },
    FilterExpression: "#start < :now AND #end > :now",
    ExpressionAttributeNames: {
     "#start": "start",
     "#end": "end",
   },
   ProjectionExpression: "id, #start, #end, activity_id",
    TableName: process.env["event_table"]
   };
   
   const results = await scanTable(params);
   const eventObj = results.Items[0];

   if(results.Count !== 1){
     return {};
   }
   
   const queryParams = {
    TableName : process.env["activity_table"],
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
        ":id": eventObj.activity_id
    }
};
   
   
   const activity = await queryTable(queryParams);
   console.log(activity)

   const resultObj = Object.assign(eventObj, {activity: activity.Items[0]});
   delete resultObj.activity_id;

   return resultObj;
};