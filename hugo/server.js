#!/usr/bin/env node

import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import readline from 'readline';
import * as pagefind from "pagefind";

// Helper functions
function displayHelp() {
  console.log(`A quick setup script for local GoHugo dev servers.
  Syntax: node start-hugo.mjs [-v|vv|vvv|h]
  Options:
    h: Print this Help.
    v: Verbose mode.
    vv: More verbose mode.
    vvv: Most verbose mode.
  `);
}

function elapsedTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}hrs ${mins}min ${secs}sec`;
}

function checkAndExitOnMissingTools(...tools) {
  tools.forEach(tool => {
    exec(`command -v ${tool}`, (error) => {
      if (error) {
        console.error(`Error: ${tool} is not installed or not in PATH.`);
        process.exit(1);
      }
    });
  });
}

function waitForAnyKeyPress() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.on('line', () => {
      rl.close();
      resolve();
    });
  });
}

function processServerOptions(options, serverOptions) {
  options.forEach(({ envVar, flag, log }) => {
    if (process.env[envVar] === 'true') {
      console.log(log, "ON");
      serverOptions.push(flag);
    } else {
      console.log(log, "OFF");
    }
  });
}

async function main() {
  // Load environment variables from .env file in the home directory
  const homeEnvFilePath = path.join(process.env.HOME, '.env');
  if (fs.existsSync(homeEnvFilePath)) {
    console.log('Loading .env variables from home directory');
    dotenv.config({ path: homeEnvFilePath });
  }

  // Load environment variables from .env file in the current working directory
  const projectEnvFilePath = path.join(process.cwd(), '.env');
  if (fs.existsSync(projectEnvFilePath)) {
    console.log('Loading .env variables from project directory');
    dotenv.config({ path: projectEnvFilePath });
  }

  // Determine paths
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Command-line argument parsing
  const argv = yargs(hideBin(process.argv))
    .option('port', {
      alias: 'p',
      type: 'string',
      description: 'Specify the port for Hugo server',
    })
    .option('bind', {
      alias: 'b',
      type: 'string',
      description: 'Specify the IP address to bind the server',
    })
    .option('environment', {
      alias: 'e',
      type: 'string',
      description: 'Specify the environment for the Hugo server',
    })
    .option('v', {
      type: 'boolean',
      description: 'Verbose mode',
    })
    .option('vv', {
      type: 'boolean',
      description: 'More verbose mode',
    })
    .option('vvv', {
      type: 'boolean',
      description: 'Most verbose mode',
    })
    .help('h')
    .alias('h', 'help')
    .argv;

  let verbosityLevel = 0;
  if (argv.vvv) {
    verbosityLevel = 3;
  } else if (argv.vv) {
    verbosityLevel = 2;
  } else if (argv.v) {
    verbosityLevel = 1;
  }

  // Starting script
  const startTime = Date.now();
  process.on('SIGINT', () => {
    console.clear();
    console.log(`Terminated with Ctrl+C\nElapsed: ${elapsedTime(Math.floor((Date.now() - startTime) / 1000))}`);
    process.exit(0);
  });

  checkAndExitOnMissingTools('hugo', 'npm');

  // Clean public directory
  exec('rm -rf public', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${stderr}`);
      process.exit(1);
    }
    if (verbosityLevel >= 1) {
      console.log(stdout);
    }
  });

  // Recreate SSL certificates
  exec('hugo server trust', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${stderr}`);
      process.exit(1);
    }
    if (verbosityLevel >= 1) {
      console.log(stdout);
    }
  });

  // Correct path construction for replacements file
  const replacementsFile = path.join(__dirname, '..', 'etc', 'hugo', 'replacements');
  if (verbosityLevel >= 1) {
    console.log(replacementsFile);
  }

  let hugoModuleReplacements = '';
  if (fs.existsSync(replacementsFile)) {
    const replacements = fs.readFileSync(replacementsFile, 'utf8')
      .split('\n')
      .slice(1)
      .filter(line => line.trim() !== ''); // Filter out empty lines

    if (verbosityLevel >= 2) {
      console.log(replacements);
    }
    hugoModuleReplacements = replacements.map(line => line.split(/\s+/).join(' -> ')).join(',');

    if (verbosityLevel >= 2) {
      console.log(hugoModuleReplacements);
    }

    if (hugoModuleReplacements) {
      process.env.HUGO_MODULE_REPLACEMENTS = hugoModuleReplacements;
    } else {
      console.log('No replacements found');
    }
  }

  // DNB bin config
  const serverOptions = [];
  if (process.env.DNB_SERVER_DEBUG === 'true') {
    console.log('Debugging ON');
    //serverOptions.push('--printI18nWarnings', '--printPathWarnings', '--printUnusedTemplates', '--debug', '--verbose',
    serverOptions.push('--printI18nWarnings', '--printPathWarnings');
  } else {
    console.log('Debugging OFF');
  }

  // Define server options configurations
  const serverConfigurations = [
    { envVar: 'DNB_SERVER_FUTURE', flag: '--buildFuture', log: 'Future Posts' },
    { envVar: 'DNB_SERVER_EXPIRED', flag: '--buildExpired', log: 'Expired Posts' },
    { envVar: 'DNB_SERVER_DRAFTS', flag: '--buildDrafts', log: 'Draft Posts' }
  ];

  // Apply the server configurations
  processServerOptions(serverConfigurations, serverOptions);

  // Start Hugo server
  const hugoArgs = [
    '--environment', argv.environment || process.env.ENVIRONMENT || 'development',
    '--disableFastRender',
    '--navigateToChanged',
    '--watch',
    '--enableGitInfo',
    '--forceSyncStatic',
    '--tlsAuto',
    '--baseURL', `https://${process.env.HOSTNAME}/`,
    '--port', argv.port || process.env.PORT || '1313',
    '--bind', argv.bind || process.env.IP || '127.0.0.1',
    ...serverOptions
  ];

  const hugoServer = spawn('hugo', ['server', ...hugoArgs], { stdio: 'inherit' });
  hugoServer.on('exit', () => {
    console.log(`Elapsed: ${elapsedTime(Math.floor((Date.now() - startTime) / 1000))}`);
  });

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

  await buildPagefindIndex();


}

main().catch(error => {
  console.error('An error occurred:', error);
});
