// MainScript.js

import { fetchLatestItem as fetchFromGitHub } from './GitHubReleasesFetcher.js';
import { fetchLatestItem as fetchFromRSS } from './RSSFeedFetcher.js';

async function run(config) {
  let fetchFunction;

  if (config.type === 'github') {
    fetchFunction = fetchFromGitHub;
  } else if (config.type === 'rss') {
    fetchFunction = fetchFromRSS;
  } else {
    console.error('Invalid source type specified.');
    return;
  }

  try {
    const latestItem = await fetchFunction(config);
    if (latestItem) {
      console.log(`Latest item: ${latestItem.title}`);
      console.log(`URL: ${latestItem.url}`);
    } else {
      console.log('No new items found.');
    }
  } catch (error) {
    console.error('Error fetching latest item:', error);
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
