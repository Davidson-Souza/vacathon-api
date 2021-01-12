/**
 * This file is like a file bucket to store and manage files
 * More information in multer github page
 */
const multer = require('multer');
const path   = require("path");
const DIR    = './uploads';

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
let upload = multer({storage: storage});

module.exports = upload;