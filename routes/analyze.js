const path = require('path')
const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser')
const router = express.Router()
const cors = require('cors');
const controller = require("../controllers/analyze").default;

const DIR = './uploads';

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
let upload = multer({storage: storage});

router.patch('/submit',upload.single('analyze'),controller.submitAnalyze);
router.get('/listUserAnalyze', controller.getUserAnalyzes);
module.exports = router;