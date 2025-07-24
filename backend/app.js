const express = require('express');
const cors = require('cors');
const app = express();

const repoRoutes = require('./routes/RepoRoutes');

app.use(cors());
app.use(express.json());

app.use('/connect-repo', repoRoutes);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
