request = require('request-json');

function syncPost(uri, data) {
    var client = request.createClient(uri);
    return new Promise(function (resolve, reject) {
        client.post('query', data, function (error, res, body) {
        if (!error && res.statusCode == 200) {
          resolve(body.reply);
        } else {
          reject(error);
        }
      });
    });
}

module.exports.syncPost = syncPost;