/**
 * @file Manage a cache file for objects/arrays
 * @author Patrick Kollitsch <patrick@davids-neighbour.com>
 */

import { readFile, writeFile, access } from 'fs/promises';
import path from 'path';

/**
 * Check if the cache file exists.
 *
 * @export
 * @param {string} filePath Path to the file.
 * @return {Promise<boolean>} Promise that resolves with true if the file exists, otherwise false.
 */
export async function cacheFileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read the cache file and parse its JSON content.
 * If the file doesn't exist, returns an empty array.
 * If the file exists but is empty or has invalid JSON, also returns an empty array.
 *
 * @export
 * @param {string} filePath Path to the file.
 * @return {Promise<Object|Array>} Promise that resolves with the parsed JSON object or array from the file, or an empty array if the file does not exist or is empty/invalid.
 */
export async function readCache(filePath) {
  try {
    const data = await readFile(filePath, { encoding: 'utf8' });
    // Check if the file is empty or if the content is not valid JSON
    return data.trim() ? JSON.parse(data) : [];
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return [];
    }
    throw error;
  }
}

/**
 * Write data to the cache file in JSON format.
 *
 * @export
 * @param {string} filePath Path to the file.
 * @param {Object|Array} data The data to write, which should be an object or array.
 */
export async function writeCache(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Creates a path for the cache file based on the service name and an optional path.
 *
 * @export
 * @param {string} service The name of the service (required).
 * @param {string} [cachePath='./resources/'] The base path where the cache files are stored (optional).
 * @return {string} The full path to the cache file.
 */
export function createCacheFilePath(service, cachePath = './resources/') {
  if (!service) {
    throw new Error('Service name is required');
  }
  return path.join(cachePath, `${service}.json`);
}
