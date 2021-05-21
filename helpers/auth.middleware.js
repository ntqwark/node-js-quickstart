const config = require("../config/config");
const sql = require("../models/db.js");

const Auth = require("../models/auth.model.js");

const { renderPage, renderMessage, renderError } = require("../helpers/page.renderer.js");

exports.loggedIn = async function (req, res, next) {
    let token = req.cookies.token;
    if (!token) return res.status(401).render("forms/message", {
        req: req,
        formTopic: `Доступ запрещен: необходимо быть авторизированным`,
        submitText: "ОК",
        backHref: "/",
        formAction: "/"
    });

    try {
        let verified = await Auth.verifySession(token);

        if (!verified) {
            res.clearCookie("token");
            res.clearCookie("admin");

            return res.render("forms/message", {
                req: req,
                formTopic: "Ваша сессия недействительна. Пройдите авторизацию повторно",
                submitText: "ОК",
                backHref: "/",
                formAction: "/"
            });
        }
        
        next();
    }
    catch (err) {
        res.status(400).send(err);
    }
}

exports.adminOnly = async function (req, res, next) {
    let token = req.cookies.token;
    if (!token) return res.status(401).render("forms/message", {
        req: req,
        formTopic: `Доступ запрещен: необходимо быть авторизированным`,
        submitText: "ОК",
        backHref: "/",
        formAction: "/"
    });

    try {
        let rows = await sql.query
          (`SELECT t.email, t.name, t.status, joined.session
            FROM users t 
            INNER JOIN sessions joined ON joined.userid = t.id
            WHERE joined.session = ?`, token);

        if (rows.length == 0) {
            res.clearCookie("token");
            res.clearCookie("admin");
            
            return res.render("forms/message", {
                req: req,
                formTopic: "Ваша сессия недействительна. Пройдите авторизацию повторно",
                submitText: "ОК",
                backHref: "/",
                formAction: "/"
            });
        }

        if (rows[0].status <= 10) {
            res.clearCookie("admin");
            return res.render("forms/message", {
                req: req,
                formTopic: "Доступ запрещен: Вы не являетесь администратором",
                submitText: "ОК",
                backHref: "/",
                formAction: "/"
            });
        } else {
            req.cookies.admin = true;
            res.cookie("admin", "true");
        }
        
        next();
    }
    catch (err) {
        res.render("forms/message", {
            req: req,
            formTopic: `Ошибка: ${JSON.stringify(err)}`,
            submitText: "ОК",
            backHref: "/",
            formAction: "/"
        });
    }
}

exports.unauthorizedOnly = async function (req, res, next) {
    let token = req.cookies.token;
    if (!token) return next();

    try {
        let rows = await sql.query("SELECT * FROM sessions WHERE session = ?", token);

        if (rows.length != 0) {
             return  res.render("forms/message", {
                req: req,
                formTopic: `Ошибка: Вы уже авторизированы`,
                submitText: "ОК",
                backHref: "/",
                formAction: "/account"
            });
        }
        
        next();
    }
    catch (err) {
        res.render("forms/message", {
            req: req,
            formTopic: `Ошибка: ${JSON.stringify(err)}`,
            submitText: "ОК",
            backHref: "/",
            formAction: "/"
        });
    }
}

exports.updateCookies = async function (req, res, next) {
    let token = req.cookies.token;
    if (!token) return next();

    try {
        let rows = await sql.query("SELECT * FROM sessions WHERE session = ?", token);

        if (rows.length != 0) {
             return  res.render("forms/message", {
                req: req,
                formTopic: `Ошибка: Вы уже авторизированы`,
                submitText: "ОК",
                backHref: "/",
                formAction: "/account"
            });
        }
        
        next();
    }
    catch (err) {
        res.render("forms/message", {
            req: req,
            formTopic: `Ошибка: ${JSON.stringify(err)}`,
            submitText: "ОК",
            backHref: "/",
            formAction: "/"
        });
    }
}