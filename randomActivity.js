const aws = require('aws-sdk');
const uuid = require('uuid');

// Create DynamoDB service object
var ddb = new aws.DynamoDB({apiVersion: '2012-08-10'});

async function scanTable(params){
  return new Promise((resolve, reject) => {
      ddb.scan(params, (err, data) => {
         if(err){
             reject(err);
         }
        if(data.Items.length === 0){
          resolve(null);
        }else{
          resolve(data.Items[0].id.S);
        }
    });
  });
}

async function findActivityId(){
  var lastKeyEvaluated = { "id": {"S": uuid.v4()} }
  
  var params = {
      TableName: process.env["activity_table"],
      ExclusiveStartKey: lastKeyEvaluated,
      Limit: 1
  };
  
  let result = null;
  let limit = 0;

  // It is a hackthon after all... :D
  do{
    result = await scanTable(params);
    params.ExclusiveStartKey.id.S = uuid.v4();
    limit++;
  }while(!result && limit < 100);
  
  return result;
}


exports.handler = async (event) => {
    const result = await findActivityId();
    return result;
};