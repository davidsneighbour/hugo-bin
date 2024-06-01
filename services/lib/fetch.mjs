import https from 'https';

/**
 * fetch a URL via GET request
 *
 * @export
 * @param {string} url
 * @param {string} [userAgent='kollitsch.dev/1.0.0']
 * @return {Promise<object|array>}
 */
export async function fetchReleases(url, userAgent = 'kollitsch.dev/1.0.0') {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: { 'User-Agent': userAgent, },
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const releases = JSON.parse(data);
                    resolve(releases);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}
