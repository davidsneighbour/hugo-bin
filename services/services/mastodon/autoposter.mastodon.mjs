import { manageReleases } from '../../autoposter.utils.mjs';
import { consola } from 'consola';

async function run() {
  const config = {
    repoUrl: 'https://api.github.com/repos/davidsneighbour/hugo-modules/releases',
    cacheFilePath: './cachedIDs.json',
    userAgent: 'YourApp (contact@example.com)',
  };

  try {
    const releaseInfo = await manageReleases(config);
    if (releaseInfo) {
      consola.log(`Latest release: ${releaseInfo.tagName}`);
      consola.log(`Release URL: ${releaseInfo.htmlUrl}`);
    }
  } catch (error) {
    consola.error('Error managing releases:', error);
  }
}

run();
