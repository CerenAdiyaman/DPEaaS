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

// @brief Connecting github repo and cloning if not exists - also fetches repo details 
exports.connectAndFetch = async (repoUrl, token) => {
  const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');
  console.log("Connecting to repo:", { owner, repo });

  const headers = token ? {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  } : {};

  //We need to clone the repo if it doesn't exist
  const localPath = cloneRepo(repoUrl, owner, repo);

  // Fetch repository details
  const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  console.log("Repo name:", repoRes.data.full_name);
  console.log("Default branch:", repoRes.data.default_branch);

  const prRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, { headers });
  console.log("PR count:", prRes.data.length);

  return {
    repository: repoRes.data.full_name,
    default_branch: repoRes.data.default_branch,
    pullRequests: prRes.data.map(pr => ({
      url: pr.html_url,
      title: pr.title
    }))
  };
};
