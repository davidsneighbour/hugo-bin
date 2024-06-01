import { readCache, writeCache } from './src/cache.mjs';
import { fetchReleases } from './autoposter.utils.mjs';

async function fetchReleases(url, userAgent) {
  // Function implementation remains the same as before...
}

export async function fetchLatestItem(config) {
  const { repoUrl, cacheFilePath, userAgent } = config;
  const releases = await fetchReleases(repoUrl, userAgent);
  const cachedIDs = await readCache(cacheFilePath);
  const newRelease = releases.find(release => !cachedIDs.includes(release.id));

  if (newRelease) {
    cachedIDs.push(newRelease.id);
    await writeCache(cacheFilePath, cachedIDs);
    return { title: newRelease.tag_name, url: newRelease.html_url };
  }

  return null;
}
