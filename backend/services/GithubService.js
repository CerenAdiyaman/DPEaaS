const axios = require('axios');
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

// @brief Function to check if the repository is already cloned
function isRepoCloned(owner, repo) {
  const repoPath = path.join(__dirname, '..', 'repos', `${owner}-${repo}`);
  return fs.existsSync(repoPath);
}

// @brief Clone the repository if it doesn't exist
function cloneRepo(repoUrl, owner, repo) {
  const repoPath = path.join(__dirname, '..', 'repos', `${owner}-${repo}`);
  if(!isRepoCloned(owner, repo)) {
    console.log(`Cloning repository ${repoUrl} into ${repoPath}`);
    execSync(`git clone https://github.com/${owner}/${repo}.git ${repoPath}`, { stdio: 'inherit' });
  } else {
    console.log(`Repo already cloned: ${repoPath}`);
  }
  return repoPath;
}

function pullPRinBranch(repoPath, prNumber) {
  console.log(`Pulling PR #${prNumber} in branch`);
try {
  execSync(`git -C ${repoPath} branch -D pr-${prNumber}`, { stdio: 'inherit' });
  console.log(`Deleted existing branch pr-${prNumber}`);
} catch (e) {
  // dal yoksa boşver
  console.log(`Branch pr-${prNumber} does not exist, continuing...`);
}
execSync(`git -C ${repoPath} checkout main`, { stdio: 'inherit' });
execSync(`git -C ${repoPath} fetch origin pull/${prNumber}/head:pr-${prNumber}`, { stdio: 'inherit' });
execSync(`git -C ${repoPath} checkout pr-${prNumber}`, { stdio: 'inherit' });
  console.log(`Checked out PR #${prNumber} in branch pr-${prNumber}`);

}

// @brief Connecting github repo and cloning if not exists - also fetches repo details 
exports.connectAndFetch = async (repoUrl, token) => {
  const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');
  console.log("Connecting to repo:", { owner, repo });

  const headers = token ? {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  } : {};

  let localPath = path.join(__dirname, '..', 'repos', `${owner}-${repo}`);
  if (!isRepoCloned(owner, repo)) {
    console.log(`Repository ${owner}/${repo} is not cloned. Cloning now...`);
    localPath = cloneRepo(repoUrl, owner, repo);
  } else {
    console.log(`Repository ${owner}/${repo} is already cloned.`);
  }

  const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  const prRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, { headers });

  return {
    repository: repoRes.data.full_name,
    default_branch: repoRes.data.default_branch,
    localPath: localPath, 
    pullRequests: prRes.data.map(pr => ({
      url: pr.html_url,
      title: pr.title
    }))
  };
};


exports.pullPRinBranch = pullPRinBranch;

