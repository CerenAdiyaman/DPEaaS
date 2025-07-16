const express = require('express');
const router = express.Router();
const repoController = require('../controllers/RepoController');


router.post('/connect-repo', repoController.connectRepo);

module.exports = router;
