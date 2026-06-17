const https = require('https');
const options = {
  hostname: 'overpass-api.de',
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
};
const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
req.write('[out:json];way["name"="Kebun Kelapa Sawit PT. Bio"];out center;');
req.end();
