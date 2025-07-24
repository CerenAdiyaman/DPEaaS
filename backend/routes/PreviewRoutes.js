const express = require('express');
const router = express.Router();
const previewController = require('../controllers/PreviewController');

router.post('/create', previewController.createPreview);
router.delete('/delete', previewController.deletePreview);

module.exports = router;