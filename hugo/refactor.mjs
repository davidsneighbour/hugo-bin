const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');

function loadEnvironmentVariables() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  }
}

function usage() {
  console.log(`Usage: node ${path.basename(__filename)} <directory>`);
  process.exit(1);
}

if (process.argv.length !== 3) {
  usage();
}

const directory = process.argv[2];
const scriptDirectory = __dirname;
const conversionFile = path.join(scriptDirectory, 'aliases.toml');

if (!fs.existsSync(directory)) {
  console.error(`Directory '${directory}' not found.`);
  process.exit(1);
}
if (!fs.existsSync(conversionFile)) {
  console.error(`Conversion file '${conversionFile}' not found.`);
  process.exit(1);
}

function replaceStrings(filePath, searchString, replaceString) {
  exec(`sed -i -E "s/(\\s|\\(|\\{)(${searchString})(\\s|\\)|\\})/\\1${replaceString}\\3/g" ${filePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error replacing in file ${filePath}:`, error);
      return;
    }
    if (stderr) {
      console.error(`Stderr for file ${filePath}:`, stderr);
      return;
    }
    console.log(`Replaced '${searchString}' with '${replaceString}' in ${filePath}`);
  });
}

const readInterface = readline.createInterface({
  input: fs.createReadStream(conversionFile),
  console: false
});

readInterface.on('line', (line) => {
  const [searchStringRaw, replaceStringRaw] = line.split('=');
  const searchString = searchStringRaw.trim().replace(/[-\s]/g, '');
  const replaceString = replaceStringRaw.trim().replace(/[-"\s]/g, '');

  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${directory}:`, err);
      process.exit(1);
    }
    files.forEach(file => {
      const filePath = path.join(directory, file);
      replaceStrings(filePath, searchString, replaceString);
    });
  });
});

readInterface.on('close', () => {
  console.log('Replacement complete.');
});

loadEnvironmentVariables();
