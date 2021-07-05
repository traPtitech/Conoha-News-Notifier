import { NotificationsResponse } from './types'

function getProp(key: string) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return PropertiesService.getScriptProperties().getProperty(key)!
}

const WEBHOOK_ID = '71967de3-17b6-4597-8608-1a4709eaeee5'
const WEBHOOK_SECRET = getProp('WEBHOOK_SECRET')
const X_AUTH_TOKEN = getProp('X_AUTH_TOKEN')
const TENANT_ID = getProp('TENANT_ID')

function sendMessage(message: string) {
  const signature = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_1,
    message,
    WEBHOOK_SECRET,
    Utilities.Charset.UTF_8
  )
  const sign = signature.reduce((str, ch) => {
    const chr = (ch < 0 ? ch + 256 : ch).toString(16)
    return str + (chr.length === 1 ? '0' : '') + chr
  }, '')

  UrlFetchApp.fetch(`https://q.trap.jp/api/v3/webhooks/${WEBHOOK_ID}`, {
    method: 'post',
    contentType: 'text/plain; charset=utf-8',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-TRAQ-Signature': sign
    },
    payload: message
  })
}

function conohaNewsNotifier() {
  const URL = `https://account.tyo1.conoha.io/v1/${TENANT_ID}/notifications?limit=5`
  const headers = {
    'X-Auth-Token': X_AUTH_TOKEN
  }
  const options = {
    headers: headers
  }
  const data = UrlFetchApp.fetch(URL, options)
  const jsonData: NotificationsResponse = JSON.parse(data.getContentText())
  const notifications = jsonData.notifications

  notifications
    .filter(notification => {
      const type = notification.type
      return type === 'Failure' || type === 'Maintenance'
    })
    .forEach(notification => {
      const type = notification.type
      const text = `## ${notification.title}\n\n${notification.contents}`
      sendMessage(text)
    })
}
