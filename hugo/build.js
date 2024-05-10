// Import necessary modules
import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Determine the current working directory and file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CURPATH = process.cwd();

// Check for required tools
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

// Load environment variables from `.env` file if present
function loadEnvVariables() {
    const envFile = path.join(CURPATH, '.env');
    if (fs.existsSync(envFile)) {
        dotenv.config({ path: envFile });
    }
}

// Check if required Git submodules are clean
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

// Process replacements for Hugo modules
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

// Parse command-line arguments for `baseURL`
function parseArguments() {
    const baseURLParam = process.argv[2];
    return baseURLParam ? `--baseURL=${baseURLParam}` : '';
}

// Run Hugo with the appropriate arguments and environment variables
function runHugo(baseURLParam) {
    // Run the clean command
    spawnSync('npm', ['run', 'clean'], { stdio: 'inherit' });

    // Update Hugo modules
    spawnSync('hugo', ['mod', 'get', '-u', './...'], { stdio: 'inherit' });

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

// Main function to orchestrate the steps
function main() {
    checkRequiredTools();
    loadEnvVariables();
    // checkModules(); // Uncomment if module check is needed
    const baseURLParam = parseArguments();
    processReplacements();
    runHugo(baseURLParam);
}

main();
