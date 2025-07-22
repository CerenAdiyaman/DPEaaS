const express = require('express');
const router = express.Router();
const RepoController = require('../controllers/RepoController');

router.post('/create-preview', repoController.createPreview);
//router.delete('/delete-preview', repoController.deletePreview);

module.exports = router;