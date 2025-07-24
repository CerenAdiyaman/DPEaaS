const express = require('express');
const cors = require('cors');
const app = express();

const repoRoutes = require('./routes/RepoRoutes');
const previewRoutes = require('./routes/PreviewRoutes');

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.use('/connect-repo', repoRoutes);
app.use('/create-preview', previewRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, (err) => {
  if (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`📋 Available routes:`);
  console.log(`   GET  /                     - Health check`);
  console.log(`   POST /connect-repo         - Connect to GitHub repo`);
  console.log(`   POST /create-preview/create - Create preview`);
  console.log(`   DELETE /create-preview/delete - Delete preview`);
});
