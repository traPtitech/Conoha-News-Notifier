import { NotificationsResponse, TokenResponse } from './types'

function getProp(key: string) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return PropertiesService.getScriptProperties().getProperty(key)!
}
function setProp(key: string, val: string) {
  return PropertiesService.getScriptProperties().setProperty(key, val)
}

const LAST_UPDATED_PROP_KEY = 'lastUpdated'
const WEBHOOK_ID = '71967de3-17b6-4597-8608-1a4709eaeee5'
const WEBHOOK_SECRET = getProp('WEBHOOK_SECRET')
const USERNAME = getProp('USERNAME')
const PASSWORD = getProp('PASSWORD')
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

function getToken() {
  const tokenURL = `https://identity.tyo1.conoha.io/v2.0/tokens`
  const tokenAuth = {
    auth: {
      passwordCredentials: {
        username: USERNAME,
        password: PASSWORD
      },
      tenantId: TENANT_ID
    }
  }
  const tokenOptions = {
    methods: 'post',
    header: {
      accept: 'application/json'
    },
    payload: JSON.stringify(tokenAuth)
  }
  const tokenData = UrlFetchApp.fetch(tokenURL, tokenOptions)
  const jsonTokenData: TokenResponse = JSON.parse(tokenData.getContentText())
  const tokenID = jsonTokenData.access.token.id
  return tokenID
}

function conohaNewsNotifier() {
  const URL = `https://account.tyo1.conoha.io/v1/${TENANT_ID}/notifications?limit=5`
  const options = {
    headers: {
      'X-Auth-Token': getToken()
    }
  }
  const data = UrlFetchApp.fetch(URL, options)
  const jsonData: NotificationsResponse = JSON.parse(data.getContentText())
  const notifications = jsonData.notifications

  const v = getProp(LAST_UPDATED_PROP_KEY)
  const lastUpdated = new Date(v)

  notifications
    .filter(notification => {
      const updated = new Date(notification.start_date)
      const type = notification.type
      return (
        (type === 'Failure' || type === 'Maintenance') && lastUpdated < updated
      )
    })
    .forEach(notification => {
      const text = `## ${notification.title}\n\n${notification.contents.replace(
        /\r\n/g,
        '\n'
      )}`
      sendMessage(text)
    })

  setProp(LAST_UPDATED_PROP_KEY, notifications[0].start_date)
}
