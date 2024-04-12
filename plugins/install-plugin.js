import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to check if the repository exists and is public
const checkRepository = (username, reponame) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${username}/${reponame}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const repoInfo = JSON.parse(data);
        if (res.statusCode === 200 && !repoInfo.private) {
          resolve();
        } else {
          reject(new Error(`Repository '${username}/${reponame}' not found.`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Get the username and repository name from the command-line argument
const [username, reponame] = process.argv[2].split('/');

if (!username || !reponame) {
  console.error('Usage: npm run install-plugin.js <username/repository>');
  process.exit(1);
}

// Check if the repository exists and is public
checkRepository(username, reponame)
  .then(() => {
    const repositoryUrl = `https://github.com/${username}/${reponame}.git`;

    // Change into the plugins directory
    process.chdir(__dirname);

    // Clone repository into the plugins directory
    execSync(`git clone ${repositoryUrl}`);

    console.log('\nInstalling dependencies and registering the plugin');
    process.chdir('..');

    execSync('npm install', { stdio: 'inherit' });

    console.log(`\n\nPlugin '${reponame}' installed successfully. Restart Recogito for the plugin to take effect.`);
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
