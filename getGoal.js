var aws = require('aws-sdk');
var queryTable = require('./queryTable').default;
var weekOfYear = require('./weekOfYear').default;

async function getGoal(event){

  const queryParams = {
    TableName : process.env["goal_table"],
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

  const result = await queryTable(queryParams);

  if(result.Count !== 1){
    return {};
  }

  const goalResult = {
    year: result.Items[0].year,
    week: result.Items[0].week,
    target: result.Items[0].target,
    current: result.Items[0].current,
    percentile: result.Items[0].current / result.Items[0].target
  };

  return goalResult;
};

exports.handler = getGoal;

getGoal().then((r) => {
  console.log(r);
});