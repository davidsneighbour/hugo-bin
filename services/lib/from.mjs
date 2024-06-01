// MainScript.js

import { fetchLatestItem as fetchFromGitHub } from './from.github.mjs';
import { fetchLatestItem as fetchFromRSS } from './from.rss.mjs';
import { consola, createConsola } from "consola";

async function run(config) {
  let fetchFunction;

  if (config.type === 'github') {
    fetchFunction = fetchFromGitHub;
  } else if (config.type === 'rss') {
    fetchFunction = fetchFromRSS;
  } else {
    consola.error('Invalid source type specified.');
    return;
  }

  try {
    const latestItem = await fetchFunction(config);
    if (latestItem) {
      consola.log(`Latest item: ${latestItem.title}`);
      consola.log(`URL: ${latestItem.url}`);
    } else {
      consola.log('No new items found.');
    }
  } catch (error) {
    consola.error('Error fetching latest item:', error);
  }
}

// Example usage
const githubConfig = {
  type: 'github',
  repoUrl: 'https://api.github.com/repos/davidsneighbour/hugo-modules/releases',
  cacheFilePath: './cachedIDs.json',
  userAgent: 'YourApp (contact@example.com)',
};

const rssConfig = {
  type: 'rss',
  feedUrl: 'https://example.com/feed.xml',
  cacheFilePath: './cachedIDs_rss.json',
};

run(githubConfig);
// or
// run(rssConfig);
