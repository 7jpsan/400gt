// 2 Events / day
// 10 Events / Week
// 1 Week = 100 points
// 1 Event = 10points
// Individually, points are percentages in an event: [0.1, 0.5, 1, 0.8]
// Max Total Per person = 10points/Expected Person 
// Actual total = MaxTotalPerson * (PersonScore * GroupMultiplier)

var saveToDynamo = require('./addToDynamo').default;
var queryTable = require('./queryTable').default;
var scanTable = require('./scanTable').default;
var deleteFromDynamo = require('./deleteFromDynamo').default;
var weekOfYear = require('./weekOfYear').default;

function groupMultiplier(percentile){
  if(percentile >= 0.9){
    return 1;
  }else if(percentile >= 0.89){
    return 0.85;
  }else if(percentile >= 0.75){
    return 0.6
  }else{
    return 3;
  }
}


async function getExpectedParticipants(eventId) {

  const queryParams = {
    TableName: process.env["event_table"],
    KeyConditionExpression   : "id = :id",
    ExpressionAttributeValues: {
      ":id": eventId
    }
  };

  const result = await queryTable(queryParams);
  return result.Items[0].participants;
}

async function getAllEntries(eventId){
  var params = {
    TableName: "400gt_eventParticipant",
    ExpressionAttributeValues: {
     ":event_id": `${eventId}`
    },
    FilterExpression: "event_id = :event_id",
   };
  return scanTable(params);
}

async function pointsCalculator(event) {

  const totalExpected = await getExpectedParticipants(event.eventId);
  const entries = await getAllEntries(event.eventId);
  const gMultiplier = groupMultiplier(entries.Items.length);

  const points = [];

  console.log(entries);

  if(!entries.Count){
    return {};
  }
  
  for(let record of entries.Items){

      const individualContribution = (10/totalExpected) * record.score * gMultiplier;
      points.push(individualContribution);
  }

  const total = points.reduce((a,b) => a+b);

  var params = {
      TableName: process.env["event_table"],
      Key: { id: event.eventId},
      UpdateExpression: "set actual_participants = :participants, score = :score",
      ExpressionAttributeValues: {
        ":participants": `${entries.Items.length}`,
        ":score": `${total}`
      }
  };
  const saveResult = await saveToDynamo(params);

  const queryParams = {
    TableName : '400gt_goal',
    KeyConditionExpression: "#yr = :year AND #wk = :week",
    ExpressionAttributeNames:{
      "#yr": "year",
      "#wk": "week"
    },
    ExpressionAttributeValues: {
        ":year": +new Date().getFullYear(),
        ":week": +weekOfYear()
    }
  };

  const currentProgress = (await queryTable(queryParams)).Items[0].current;

  var goalParams = {
    TableName: "400gt_goal",
    Key: { "year": +new Date().getFullYear(), "week": +weekOfYear() },
    UpdateExpression: "set #current = :toDate",
    ExpressionAttributeValues: {
      ":toDate": `${+currentProgress+total}`
    },
    ExpressionAttributeNames:{
      "#current": "current",
    },
  };
  await saveToDynamo(goalParams);

  //Delete from dynamo.... Talking about SOLID... 
  for(let entry of entries.Items){
    console.log(entry.user);
    var params = {
      TableName: "400gt_eventParticipant",
      Key:{ user: entry.user, event_id: event.eventId },
      ConditionExpression:"event_id = :val",
      ExpressionAttributeValues: {
          ":val": event.eventId
      }
    };
    //await deleteFromDynamo(params);
  }


  return saveResult;
};

exports.handler = pointsCalculator;