import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import readline from 'readline';

// Helper functions
function displayHelp() {
  console.log(`A quick setup script for local GoHugo dev servers.
  Syntax: node start-hugo.mjs [-v|h]
  Options:
    h: Print this Help.
    v: Verbose mode.
  `);
}

function elapsedTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}hrs ${mins}min ${secs}sec`;
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
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Enable verbose mode',
  })
  .help('h')
  .alias('h', 'help')
  .argv;

const verboseMode = argv.verbose;

// Starting script
const startTime = Date.now();
process.on('SIGINT', () => {
  console.clear();
  console.log(`Terminated with Ctrl+C\nElapsed: ${elapsedTime(Math.floor((Date.now() - startTime) / 1000))}`);
  process.exit(0);
});

// Function to ensure required tools are available
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

checkAndExitOnMissingTools('hugo', 'npm');

// Load `.env` if available
const envFilePath = path.join(process.cwd(), '.env');
if (fs.existsSync(envFilePath)) {
  console.log('Exporting .env variables');
  dotenv.config({ path: envFilePath });
}

// Clean public directory
exec('rm -rf public', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${stderr}`);
    process.exit(1);
  }
  if (verboseMode) {
    console.log(stdout);
  }
});

// Recreate SSL certificates
exec('hugo server trust', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${stderr}`);
    process.exit(1);
  }
  if (verboseMode) {
    console.log(stdout);
  }
});

// Correct path construction for replacements file
const replacementsFile = path.join(__dirname, '..', 'etc', 'hugo', 'replacements');
console.log(replacementsFile);

let hugoModuleReplacements = '';
if (fs.existsSync(replacementsFile)) {
  const replacements = fs.readFileSync(replacementsFile, 'utf8')
    .split('\n')
    .slice(1)
    .filter(line => line.trim() !== ''); // Filter out empty lines

  console.log(replacements);
  hugoModuleReplacements = replacements.map(line => line.split(/\s+/).join(' -> ')).join(',');

  console.log(hugoModuleReplacements);

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
  serverOptions.push('--printI18nWarnings', '--printPathWarnings', '--printUnusedTemplates', '--debug', '--verbose', '--logLevel', 'debug');
} else {
  console.log('Debugging OFF');
}

// Define function to wait for any key press
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

// Define server options configurations
const serverConfigurations = [
  { envVar: 'DNB_SERVER_FUTURE', flag: '--buildFuture', log: 'Future Posts' },
  { envVar: 'DNB_SERVER_EXPIRED', flag: '--buildExpired', log: 'Expired Posts' },
  { envVar: 'DNB_SERVER_DRAFTS', flag: '--buildDrafts', log: 'Draft Posts' }
];

// Function to process each server configuration
function processServerOptions(options) {
  options.forEach(({ envVar, flag, log }) => {
    if (process.env[envVar] === 'true') {
      console.log(log, "ON");
      serverOptions.push(flag);
    } else {
      console.log(log, "OFF");
    }
  });
}

// Apply the server configurations
processServerOptions(serverConfigurations);

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
