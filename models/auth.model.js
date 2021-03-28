const sql = require("./db.js");
const bcrypt = require('bcrypt');

class Auth {
    static async createSession(user) {
        let salt = await bcrypt.genSalt(10);
        let session = await bcrypt.hash(salt, salt);
        
        let insert = await sql.query("INSERT INTO `sessions` (`userid`, `session`) VALUES (?, ?)", [user.id, session]);
    
        return session;
    };
}

module.exports = Auth;