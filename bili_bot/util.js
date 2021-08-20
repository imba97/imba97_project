export const getUrlFileName = (url) => {
  const reg = new RegExp('.(jpe?g|png|gif)$')
  if (!reg.test(url)) return null

  const urlSplit = url.split('/')
  if (!urlSplit) return null

  const img = urlSplit.pop()

  return img
}
