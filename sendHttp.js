var https = require('https');

async function sendHttp(url, method, path, body){

  return new Promise((resolve, reject) => {

    const options = {
      hostname: url,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const chunks = [];
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
        res.on('data', (chunk) => {
          chunks.push(Buffer.from(chunk, 'utf-8'));
        });
        res.on('end', () => {
          try{
            const botResponse = JSON.parse(Buffer.concat(chunks).toString());
            resolve(botResponse);
          }catch(err){
            resolve({totalMember: 5});
          }
        });
    });
    req.on('error', (e) => {
      reject(e, "Error has occured");
    });
    if(body){
      req.write(body)
    }
    req.end();
  });
}

exports.default = sendHttp;
