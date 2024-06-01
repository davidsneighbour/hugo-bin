// RSSFeedFetcher.js

import https from 'https';
import { readCache, writeCache } from './src/cache.mjs';
import { readFile, writeFile } from 'fs/promises';
import xml2js from 'xml2js'; // You'll need to install xml2js: npm install xml2js

async function fetchRSSFeed(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

export async function fetchLatestItem(config) {
  const { feedUrl, cacheFilePath } = config;
  const feedData = await fetchRSSFeed(feedUrl);
  const parsedFeed = await xml2js.parseStringPromise(feedData);

  const cachedIDs = await readCache(cacheFilePath);
  const newPost = parsedFeed.rss.channel[0].item.find(post => !cachedIDs.includes(post.guid[0]._));

  if (newPost) {
    cachedIDs.push(newPost.guid[0]._);
    await writeCache(cacheFilePath, cachedIDs);
    return { title: newPost.title[0], url: newPost.link[0] };
  }

  return null;
}
