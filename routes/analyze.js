const express = require('express');
const router = express.Router();
const controller = require("../controllers/analyze").default;
const upload = require("../controllers/storage");

router.patch('/submit',upload.single('analyze'),controller.submitAnalyze);
router.get('/listUserAnalyze', controller.getUserAnalyzes);
module.exports = router;