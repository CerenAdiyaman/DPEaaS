const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');

const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Project started' });
});

app.post('/generate-preview', async (req, res) => {
  const { repoUrl, token } = req.body;

  try {
    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');
    if (!owner || !repo) return res.status(400).json({ error: 'Invalid repo URL' });

    const headers = token ? {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    } : {};

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      { headers }
    );

    res.json(response.data);
  } catch (err) {
    console.error('GitHub API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch PRs from GitHub' });
  }
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
