function wikiUpdateNotificator() {
  const URL = `https://wiki.trap.jp/_api/pages.list?access_token=${ACCESS_TOKEN}&path=%2F`
  const data = UrlFetchApp.fetch(URL)
  const jsonData: ArticlesResponse = JSON.parse(data.getContentText())
  const articles = jsonData.pages

  const v = getProp(LAST_UPDATED_PROP_KEY)
  const lastUpdated = new Date(v)

  articles
    .filter(article => {
      const updated = new Date(article.updatedAt)
      return lastUpdated < updated
    })
    .forEach(article => {
      const encodedArticlePath = encodeURI(article.path)
      const text =
        `${article.revision.author.username}が[${article.path}](https://wiki.trap.jp${encodedArticlePath})を更新しました\n` +
        `\n\n` +
        `> ${article.revision.body.split('\r\n').slice(0, 4).join('\n> ')}`
      sendMessage(text)
    })

  setProp(LAST_UPDATED_PROP_KEY, articles[0].updatedAt)
}
