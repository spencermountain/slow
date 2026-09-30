import { walk } from './src/index.js'

let urls = [
  'https://en.wikipedia.org/wiki/New_York_Yankees',
  'https://en.wikipedia.org/wiki/Toronto_Blue_Jays',
  'https://en.wikipedia.org/wiki/Boston_Red_Sox',
]
const pages = await walk(urls, async (url) => {
  const res = await fetch(url, { method: 'HEAD' })
  return { url, modified: res.headers.get('last-modified') }
})
console.log(pages)
