#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import fetch from 'node-fetch';
import { readFile } from 'fs/promises';
import open from 'open';
import dotenv from 'dotenv';
import { consola, createConsola } from "consola"; import { intro, outro } from '@clack/prompts';


const REQUIRED_TOOLS = [
  'git',
  'sed',
  'node'
];

const checkRequiredTools = () => {
  for (const tool of REQUIRED_TOOLS) {
    try {
      execSync(`command -v ${tool}`, { stdio: 'ignore' });
    } catch (error) {
      consola.error(`${tool} is required...`);
      process.exit(1);
    }
  }
};

const getVersion = () => {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  return packageJson.version;
};

const exportEnvVariables = () => {
  const envFilePath = '.env';
  if (fs.existsSync(envFilePath)) {
    console.log('exporting .env');
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    const envVars = envContent.split('\n').filter(line => line);
    envVars.forEach(envVar => {
      const [key, value] = envVar.split('=');
      process.env[key] = value;
    });
  } else {
    console.log('no .env file found');
    process.exit(0);
  }
};

const fetchAndPullGitChanges = () => {
  execSync('git fetch');
  execSync('git pull');
};

const pushGitChanges = () => {
  execSync('git push origin main --follow-tags');
  execSync('git push origin --tags');
};

const createGithubRelease = async (version) => {
  const changes = await readFile('changes.md', 'utf8');
  const changesJson = JSON.stringify(changes);
  const githubRepoSlug = process.env.GITHUB_REPOSLUG;
  const githubSecret = process.env.GITHUB_SECRET;
  const tagName = `v${version}`;
  const url = `https://github.com/${githubRepoSlug}/releases/edit/v${version}`;

  const response = await fetch(`https://api.github.com/repos/${githubRepoSlug}/releases`, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `token ${githubSecret}`
    },
    body: JSON.stringify({
      tag_name: tagName,
      name: tagName,
      body: changesJson,
      generate_release_notes: false
    })
  });

  if (response.ok) {
    console.log('Release created successfully.');
    fs.unlinkSync('changes.md');
  } else {
    const responseText = await response.text();
    console.error(`Failed to create release. Status code: ${response.status}`);
    console.error(responseText);
    execSync('code changes.md');
  }

  open(url);
};

// Main function to run the script
const main = async () => {

  intro(`Running pre-release script...`);
  exportEnvVariables();



  checkRequiredTools();
  fetchAndPullGitChanges();
  const oldVersion = getVersion();
  // pushGitChanges();
  // await createGithubRelease(version);


  outro(`All done!`);
};

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
