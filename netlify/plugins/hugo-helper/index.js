import { join } from 'node:path';
import * as glob from 'glob';

const getResourcesDirectory = ({ inputs }) => {
  return join(inputs.srcdir, 'resources');
};

const getDebug = ({ inputs }) => {
  return inputs.debug;
};

const getCache = ({ inputs }) => {
  return inputs.cache;
};

/**
 *
 * @param {*} items object to be debugged
 * @param {*} inputs configuration object
 */
const printList = (items, inputs) => {
  if (getDebug({ inputs }) === true) {
    console.log(items);
  }
};

export async function onPreBuild({ utils, inputs }) {
  // hook onPreBuild: runs before the build command is executed.
  const path = getResourcesDirectory({ inputs });
  const loadCache = getCache({ inputs });
  if (loadCache) {
    const success = await utils.cache.restore(path);
    console.log(`Checking if resources exist at "${path}"`);

    if (success) {
      const cachedFiles = await utils.cache.list(path);

      const files = [...new Set(cachedFiles.flatMap((c) => glob.sync(`${c}/**/*`, { nodir: true })))];

      console.log(`Restored cached resources folder. Total files: ${files.length}`);
      printList(files, inputs);
    } else {
      console.log(`No cache found for resources folder`);
    }
  }
}

export async function onBuild({ utils, inputs }) {
  // hook onBuild: runs directly after the build command is executed and before
  //               Functions bundling.
}

export async function onPostBuild({ utils, inputs }) {
  // hook onPostBuild: runs after the build command completes;
  //                   after onBuild tasks and Functions bundling are executed;
  //                   and before the deploy stage.
  //                   Can be used to prevent a build from being deployed.
  const path = getResourcesDirectory({ inputs });
  const loadCache = getCache({ inputs });
  if (loadCache) {
    const success = await utils.cache.save(path);

    if (success) {
      const cached = await utils.cache.list(path);
      const files = [...new Set(cached.flatMap((c) => glob.sync(`${c}/**/*`, { nodir: true })))];
      console.log(`Saved resources folder to cache. Total files: ${files.length}`);
      printList(files, inputs);
    } else {
      console.log(`No resources folder cached`);
    }
  }
}

export async function onSuccess({ utils, inputs, constants, netlifyConfig }) {
  // hook onSuccess: runs when the deploy succeeds. Can't be used to prevent
  //                 a build from being deployed.
  // console.log(utils);
  // console.log(inputs);
  // console.log(constants);
  // console.log(netlifyConfig);
}

export async function onError({ utils, inputs }) {
  // hook onError: runs when an error occurs in the build or deploy stage,
  //               failing the build. Can’t be used to prevent a build from
  //               being deployed.
}

export async function onEnd({ utils, inputs }) {
  // hook onEnd: runs after completion of the deploy stage, regardless of build
  //             error or success; is useful for resources cleanup. Can't be
  //             used to prevent a build from being deployed.
}

export async function onPreDev({ utils, inputs }) {
  // hook onPreDev: runs before onDev.
}

export async function onDev({ utils, inputs }) {
  // hook onDev: runs directly before the dev command.
}
