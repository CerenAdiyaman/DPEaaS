const express = require('express');
const app = express();
const cors = require('cors');
const repoRoutes = require('./routes/RepoRoutes');
const previewRoutes = require('./routes/previewRoutes');

const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/connect-repo', repoRoutes);
app.use('/preview', previewRoutes);

module.exports = app;