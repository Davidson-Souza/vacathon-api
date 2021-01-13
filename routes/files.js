var express = require('express');
var router = express.Router();
const fs = require("fs");
router.get("/", (req, res) =>
{
    res.end("fkdj");
})

router.get("/:filename", (req, res) =>
{
    if(!(req.params && req.params.filename))
            return res.status(400).end({ok:false, err:"Missing filename"});
    
    fs.readFile(`./uploads/${req.params.filename}`, (e, d) =>
    {
        if(e)
        {
            res.status(404);
            return res.end("Not found");
        }
        else
        {
            res.status(200);
            res.setHeader("Content-Type", "image/jpg");
            return res.end(d);
        }
    });

})
module.exports = router;