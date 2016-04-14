module.exports = signWebhookData

var crypto = require('crypto')

function signWebhookData(key, data) {
  data = JSON.stringify(data)
  return 'sha1=' + crypto.createHmac('sha1', key).update(data).digest('hex')
}
