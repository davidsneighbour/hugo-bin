#!/usr/bin/env node

import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import * as pagefind from "pagefind";

// current working directory and file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CURPATH = process.cwd();

/**
 * Check if required tools are available.
 * Exits the process if any tool is missing.
 */
function checkRequiredTools() {
  const tools = ['hugo', 'git', 'npm'];
  const missingTools = tools.filter(tool => {
    try {
      execSync(`command -v ${tool}`);
      return false;
    } catch {
      return true;
    }
  });

  if (missingTools.length > 0) {
    console.error(`Missing required tools: ${missingTools.join(', ')}`);
    process.exit(1);
  }
}

/**
 * Load environment variables from a `.env` file if it exists.
 */
function loadEnvVariables() {
  const envFile = path.join(CURPATH, '.env');
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
  }
}

/**
 * Check if required Git submodules are clean.
 * Exits the process if any submodule has uncommitted changes.
 */
function checkModules() {
  const modules = ['hugo-modules'];
  for (const module of modules) {
    const modulePath = path.join(CURPATH, '..', module);
    if (fs.existsSync(modulePath)) {
      const gitStatus = execSync('git diff --stat', { cwd: modulePath }).toString();
      if (gitStatus.trim() !== '') {
        console.error(`${module} is dirty`);
        process.exit(128);
      }
    }
  }
}

/**
 * Process replacements for Hugo modules from a configuration file.
 * Sets the `HUGO_MODULE_REPLACEMENTS` environment variable.
 */
function processReplacements() {
  const replacementsFile = path.join(CURPATH, 'bin/etc/hugo/replacements');
  let replacements = '';
  let notFirstLine = false;

  if (fs.existsSync(replacementsFile)) {
    const lines = fs.readFileSync(replacementsFile, 'utf8').split('\n');
    for (const line of lines.slice(1)) {
      const [from, to] = line.split(/\s+/);
      if (from && to) {
        if (notFirstLine) {
          replacements += `,${from} -> ${to}`;
        } else {
          replacements = `${from} -> ${to}`;
          notFirstLine = true;
        }
      }
    }
    process.env.HUGO_MODULE_REPLACEMENTS = replacements;
  }
}

/**
 * Parse command-line arguments for `baseURL`.
 * @returns {string} The `baseURL` argument if provided, otherwise an empty string.
 */
function parseArguments() {
  const baseURLParam = process.argv[2];
  return baseURLParam ? `--baseURL=${baseURLParam}` : '';
}

/**
 * Run Hugo with the appropriate arguments and environment variables.
 * @param {string} baseURLParam - The `baseURL` argument for Hugo.
 */
function runHugo(baseURLParam) {
  // Run the clean command
  spawnSync('npm', ['run', 'clean'], { stdio: 'inherit' });

  // Update Hugo modules
  // spawnSync('hugo', ['mod', 'get', '-u', './...'], { stdio: 'inherit' });

  // Run Hugo build with the provided options
  const hugoArgs = [
    '--logLevel', process.env.LOGLEVEL || 'info',
    '--enableGitInfo',
    baseURLParam
  ].filter(Boolean);

  spawnSync('hugo', hugoArgs, {
    stdio: 'inherit',
    env: { ...process.env, HUGO_MODULE_REPLACEMENTS: process.env.HUGO_MODULE_REPLACEMENTS }
  });
}

/**
 * Pagefind index for search functionality.
 */
async function buildPagefindIndex() {
  const { index } = await pagefind.createIndex({
    rootSelector: "html",
    verbose: true,
    logfile: "debug.log"
  });

  if (index) {
    await index.addDirectory({
      path: "public"
    });
    await index.writeFiles({
      outputPath: "public/search"
    });
  }
}

/**
 * Main function to orchestrate the steps.
 */
async function main() {
  checkRequiredTools();
  loadEnvVariables();
  // checkModules(); // Uncomment if module check is needed
  const baseURLParam = parseArguments();
  processReplacements();
  runHugo(baseURLParam);
  await buildPagefindIndex();
}

main();
