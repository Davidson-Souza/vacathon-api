const crypto = require("crypto")

async function sha256(chunk)
{
    const hash = crypto.createHash('sha256');
    hash.write(chunk);
    await hash.end();
    return hash.read().toString("hex");
}
/** Double-hash makes collision attack less efficient */
async function sha256d(chunk)
{
    return sha256(await sha256(chunk));
}
/** @TODO this function is O(n⁴), improve it! */
/** Verify if a passed string is potentially harmful */
function sanitize(str)
{
    /** Is empty or too big? */
    if (str == null || str == undefined || str.length>1024)
        return -1;
    
    let c = "";
    /** Shouldn't have any non-alphanumeric digit (except emails) */
    /** Only supported: Numbers, letters, empty spaces and comma(for csv) */
    for (let i = 0; i<str.length; i++)
    {
        c = str.charAt(i);
        if((c < '0' || c > 'z') && c != ' ' && c!=',' && c!='@' && c!=".")
            return -1;
    }
    return 1;
}
exports.default = 
{
    sha256d, sanitize
}