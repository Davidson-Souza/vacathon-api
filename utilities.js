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
/** @TODO this function is O(n³), improve it! */
/** Verify if a passed string is potentially harmful */
function sanitize(str, isEmail = false, isName = false)
{
    /** Is empty or too big? */
    /**
     * NOTE: 256 is considered to be the greater string allowed in our database, is the double-sha256
     * of the user's password
     */
    if (str == null || str == undefined || str.length>256)
        return -1;
    
    let c = "";
    /** Shouldn't have any non-alphanumeric digit (except emails) */
    /** Empty spaces are ONLY allowed in names, that are explicitly marked as */
    for (let i = 0; i<str.length; i++)
    {
        c = str.charAt(i);
        if((c < '0' || c > 'z') && !isEmail)
            return -1;
        else if(((c < '0' || c > 'z') && (c !="." && c !="@")) && isEmail)
            return -1;
        else if(((c < '0' || c > 'z') && (c !=" ")) && isName)
            return -1;
    }
    return 1;
}
exports.default = 
{
    sha256d, sanitize
}