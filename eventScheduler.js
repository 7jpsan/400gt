const hasNext = require('./hasNext').default;
const sendHttp = require('./sendHttp').default;
const invokeLambda = require('./invokeLambda').default;

const aws = require('aws-sdk');
aws.config.region = 'eu-west-1';

const uuid = require('uuid');

// Create DynamoDB service object
var ddb = new aws.DynamoDB({apiVersion: '2012-08-10'});
var ddbc = new aws.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

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

async function findActivityId(){
  return invokeLambda(process.env["rand_activity_lambda"], '{}');
}

async function getLatest(){
  return invokeLambda('400gt_latestEvent', '{}');
}

async function alertBotPreStartActivity(params){
  return sendHttp('bkswz8idxa.execute-api.eu-west-1.amazonaws.com', 'POST', '/prod/pre-event-alert?start='+params.start, '{}');
}

async function alertBotStartActivity(params){
  return sendHttp('bkswz8idxa.execute-api.eu-west-1.amazonaws.com', 'POST', '/prod/event-start', params.body);
}

async function createNewEvent(event){
    if(await hasNext(ddbc)){
      return {
        "reason": "Next event is scheduled/in progress. Nothing to be done"
      };
    }
    
    var timeStart = Date.now();

    const botResult = await alertBotPreStartActivity({
      start: timeStart
    });

    if(!botResult.totalMembers){
      return {
        "reason": "Bot is not active..."
      };
    }

    // It is a top level assets folder
    try {
        const eventUUID = uuid.v4();
        const activityId = await findActivityId();
        var params = {
          TableName: process.env["events_table"],
          Item: {
            'id': {S: eventUUID},
            'activity_id' : {S: activityId.substring(1,activityId.length-1 )},
            'start' : {S: `${timeStart}`},
            'end' : {S: `${timeStart+1000*5*60}`},
            'participants': {N: `${botResult.totalMembers}`},
            'score': {N: '0'}
          }
        };
        const dbDataItem = await addToDynamo(params);

        const latest = await getLatest();

        // Call START! on BOT 
        await alertBotStartActivity({
          body: latest
        })

        return params.Item;
    } catch (err) {
        console.log(err);
        const message = `Could not save data to the table`;
        console.log(message);
        throw new Error(message);
    }
};


exports.handler = createNewEvent;