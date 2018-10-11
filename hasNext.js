async function scanTable(ddb, params){
  return new Promise((resolve, reject) => {
      ddb.scan(params, (err, data) => {
         if(err){
             reject(err);
         }
         resolve(data);
    });
  });
}

async function hasNextScheduled(ddb){
  var params = {
    ExpressionAttributeValues: {
     ":now": `${Date.now()}`
    },
    FilterExpression: "#start > :now OR (:now > #start AND #end > :now)",
    ExpressionAttributeNames: {
     "#start": "start",
     "#end": "end"
   },
   
    TableName: "400gt_events"
   };
   
   const results = await scanTable(ddb, params);

   if(results.Count){
     return true;
   }

   return false;
};

exports.default = hasNextScheduled;