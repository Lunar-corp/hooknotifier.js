
const https = require('https');
const endpoint = 'sun.hooknotifier.com';

const hookNotifierRequest = function ({ path, method, data = {} }) {
  return new Promise((resolve, reject) => {
    let body = '';

    var postData = JSON.stringify(data);

    if (typeof window === 'undefined') {
      const req = https.request({
        method,
        host: endpoint,
        path,
        headers: {
          'Content-Type': 'application/json'
        },
      }, (res) => {
        res.on('data', (d) => {
          body += d;
        });
        
        res.on('end', function() {
          resolve(body);
        });
      });

      req.on('error', (e) => {
        console.log(e);
        throw new Error('server unreachable');
      });

      req.write(postData);
      req.end();
    } else {
      const http = new XMLHttpRequest();
      const url = `https://${endpoint}${path}`;
      http.open(method, url, true);

      http.setRequestHeader("Content-type", "application/json");

      http.onreadystatechange = function() {
        if (http.readyState == 4 && http.status == 200) {
          resolve(http.responseText);
        }
      };
      http.send(postData);
    }
  });
}

const HookNotifier = function({ 
  identifier, 
  key, 
  tags = 'general', 
  color = '#FFC107', 
  sendToTeam = false, 
  preventData = false, 
  sound = true ,
}) {
  if(!identifier) { throw new Error('identifier required'); }
  if(!key) { throw new Error('key required'); }

  this.identifier = identifier;
  this.key = key;

  this.parameters = {
    tags,
    color,
    sendToTeam,
    preventData,
    sound,
  }

  hookNotifierRequest({ path: `/api/teams/${this.identifier}/${this.key}`, method: 'GET' })
    .then((res) => {
      if(res !== 'good identifiers'){
        throw new Error('wrong identifiers');
      }
    });


  this.sendNotification = function({ 
    object,
    body,
    tags = this.parameters.tags, 
    color = this.parameters.color, 
    sendToTeam = this.parameters.sendToTeam, 
    preventData = this.parameters.preventData,
    sound = this.parameters.sound,
    redirectUrl = '',
    innerData = {},
    image = '',
  }) {
    if(!object) { throw new Error('object required'); }
    if(!body) { throw new Error('body required'); }

    const parameters = `object=${encodeURIComponent(object)}&body=${encodeURIComponent(body)}&tags=${encodeURIComponent(tags)}&color=${encodeURIComponent(color)}&sendToTeam=${sendToTeam}&preventData=${preventData}&sound=${sound}&redirectUrl=${redirectUrl}&image=${image}`;

    hookNotifierRequest({ path: `/api/notifications/${this.identifier}/${this.key}?${parameters}`, method: 'POST', data: innerData });
  }
}

module.exports = HookNotifier;
