const express = require('express');
const router = express.Router();
const repoController = require('../controllers/RepoController');

router.post('/', repoController.connectRepo);

module.exports = router;
