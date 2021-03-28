const sql = require("./db.js");

// Конструктор
class User {
    constructor(user) {
        if (typeof user.id != 'undefined') {
            this.id = user.id;
        }

        this.email = user.email;
        this.name = user.name;
        this.password = user.password;
        this.status = user.status;

        if (typeof user.created_at != 'undefined') {
            this.created_at = user.created_at;
        }
        if (typeof user.updated_at != 'undefined') {
            this.updated_at = user.updated_at;
        }
    }

    static async create(newUser) {
        if (!newUser || !newUser.email)
            throw "User object or user.email object is null";

        // Проверка на дубликаты
        let rows = await sql.query('SELECT * FROM users WHERE email = ?', newUser.email)

        if (rows.length != 0)
            throw "User with specified email already exists"

        // Создание записи в БД
        let insert = await sql.query("INSERT INTO users SET ?", newUser);

        return insert.insertId;
    }

    static async getByEmail(email) {
        if (!email) throw "Email field is not specified";
        
        // Запрос пользователя из БД
        let rows = await sql.query('SELECT * FROM users WHERE email = ?', email);
        
        if (rows.length > 0)
            return rows[0];
        else
            return null;
    }
}

module.exports = User;