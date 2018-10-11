const invokeLambda = require('./invokeLambda').default;
var saveToDynamo = require('./addToDynamo').default;

async function invokeClose(){
  return invokeLambda('400gt_closeEvent', '{}');
}

async function getLatest(){
  return invokeLambda('400gt_latestEvent', '{}');
}

async function updateEndTime(eventId){

  var params = {
    TableName: "400gt_events",
    Key: { id: eventId},
    UpdateExpression: "set #end = :end",
    ExpressionAttributeNames:{
      "#end": "end"
    },
    ExpressionAttributeValues: {
      ":end": `${0}`
    }
  };
  const saveResult = await saveToDynamo(params);
}

async function finishEvent(event){
  const latest = await getLatest();
  if(latest !== '{}'){
    let latestObj = JSON.parse(latest);
    await updateEndTime(latestObj.id);
    await invokeClose();
    return ({message: "Force Close of: " + latestObj.id});
  }else{
      return ({message: "Nothing to close..."});
  }
}

exports.handler = finishEvent;

finishEvent().then((data) => {
  console.log(data);
}).catch((eee) => {
  console.error(eee);
});