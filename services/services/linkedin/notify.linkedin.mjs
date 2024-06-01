import { loadEnv, loadFeed, downloadImage } from './utils.mjs';
import { getUserProfile, postToLinkedIn } from './utils.linkedin.mjs';
import path from 'path';

/**
 * @todo implement image handling
 */
const main = async () => {

  await loadEnv();
  const { LINKEDIN_ACCESS_TOKEN, FEED_LINK } = process.env;

  try {
    const profile = await getUserProfile(LINKEDIN_ACCESS_TOKEN);
    const feed = await loadFeed(FEED_LINK);
    const localFilePath = 'image' + path.parse(feed.rss.channel[0].item[0]['media:content'][0]['$']['url']).ext;
    await downloadImage(
      feed.rss.channel[0].item[0]['media:content'][0]['$']['url'],
      localFilePath
    );
    const postResponse = await postToLinkedIn(feed, profile, LINKEDIN_ACCESS_TOKEN);

    consola.log(postResponse);
  } catch (error) {
    consola.error('Error:', error);
  }
};

main();
