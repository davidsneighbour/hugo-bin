
import { manageReleases } from './autoposter.utils.mjs'

async function run() {
  const config = {
    repoUrl: 'https://api.github.com/repos/davidsneighbour/hugo-modules/releases',
    cacheFilePath: './cachedIDs.json',
    userAgent: 'YourApp (contact@example.com)',
  };

  try {
    const releaseInfo = await manageReleases(config);
    if (releaseInfo) {
      console.log(`Latest release: ${releaseInfo.tagName}`);
      console.log(`Release URL: ${releaseInfo.htmlUrl}`);
    }
  } catch (error) {
    console.error('Error managing releases:', error);
  }
}

run();
