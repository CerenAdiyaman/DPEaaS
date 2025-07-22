const axios = require('axios');

exports.connectAndFetch = async (repoUrl, token) => {
  const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');
  console.log("Connecting to repo:", { owner, repo });

  const headers = token ? {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  } : {};

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
