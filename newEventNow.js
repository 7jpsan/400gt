const invokeLambda = require('./invokeLambda').default;

async function invokeNewEvent(){
  return invokeLambda('400gt_scheduleEvent', '{}');
}

async function startEvent(event){
  const response = await invokeNewEvent();
  return response;
}

exports.handler = startEvent;

startEvent().then((data) => {
  console.log(data);
}).catch((eee) => {
  console.error(eee);
});