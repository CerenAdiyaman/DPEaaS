const githubService = require('../services/GithubService');

exports.connectRepo = async (req, res) => {
  try {
    const result = await githubService.connectAndFetch(req.body.repoUrl, req.body.token);
    res.json(result);
  } catch (error) {
    console.error('Error connecting to repo:', error);
    res.status(500).json({ error: 'Failed to connect to repository' });
  }
};
