const config = require("../config/config");
const sql = require("../models/db.js");

const { renderPage, renderMessage, renderError } = require("../helpers/page.renderer.js");

exports.loggedIn = async function (req, res, next) {
    let token = req.cookies.token;
    if (!token) return res.status(401).send("Access Denied");

    try {
        let rows = await sql.query("SELECT * FROM sessions WHERE session = ?", token);

        if (rows.length == 0) {
            res.clearCookie("token");
            res.clearCookie("admin");
            return res.status(400).send(renderError("Ошибка", "Сессия устарела!", req));
        }
        
        next();
    }
    catch (err) {
        res.status(400).send(err);
    }
}

exports.adminOnly = async function (req, res, next) {
    let token = req.cookies.token;
    if (!token) return res.status(401).send("Access Denied");

    try {
        let rows = await sql.query
          (`SELECT t.email, t.name, t.status, joined.session
            FROM users t 
            INNER JOIN sessions joined ON joined.userid = t.id
            WHERE joined.session = ?`, token);

        if (rows.length == 0) {
            res.clearCookie("token");
            res.clearCookie("admin");
            return res.status(400).send(renderError("Ошибка", "Сессия устарела!", req));
        }

        if (rows[0].status != 1000) {
            res.clearCookie("admin");
            return res.status(400).send(renderError("Ошибка", "Доступ запрещен", req));
        } 
        
        next();
    }
    catch (err) {
        res.status(400).send(err);
    }
}

exports.unauthorizedOnly = async function (req, res, next) {
    let token = req.cookies.token;
    if (!token) return next();

    try {
        let rows = await sql.query("SELECT * FROM sessions WHERE session = ?", token);
        if (rows.length != 0) { return res.status(400).send(renderError("Ошибка", "Вы уже авторизированы!", req)); }
        
        next();
    }
    catch (err) {
        res.status(400).send(err);
    }
}