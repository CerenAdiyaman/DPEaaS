const githubService = require('../services/GithubService');

exports.connectRepo = async (req, res) => {
    try{
        const prs = await githubService.fetchPRs(req.body.repoUrl, req.body.token);
        res.json(prs);
    } catch (error) {
        console.error('Error connecting to repo:', error);
        res.status(500).json({ error: 'Failed to connect to repository' });
    }
};
