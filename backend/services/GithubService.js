const axios = require('axios');

exports.fetchPRs = async (repoUrl, token) => {
  const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');
  if (!owner || !repo) throw new Error('Invalid repo URL');

  const headers = token ? {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  } : {};

  const response = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    { headers }
  );

  return response.data;
};
