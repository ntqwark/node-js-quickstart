const router = require('express').Router();
module.exports = router;
module.exports.routeName = "/account";

const User = require("../models/user.model.js");
const Auth = require("../models/auth.model.js");

const { unauthorizedOnly, loggedIn } = require("../helpers/auth.middleware.js");

// 

// [POST] Завершение сессии
router.post("/logout", loggedIn, async (req, res) => {
    try {
        let token = req.cookies.token;
        let user = await User.getByToken(token);

        await Auth.removeSession(token);

        req = { };
        res.clearCookie("token");
        res.clearCookie("admin");

        res.render("forms/message", {
            req: req,
            formTopic: "Вы успешно вышли из аккаунта",
            submitText: "ОК",
            backHref: "/",
            formAction: "/"
        });
    }
    catch (err) {
        return res.status(401).render("error", {
            req: req,
            errorText: err
        });
    }
});

// [POST] Изменение аккаунта пользователя
router.post("/edit", loggedIn, async (req, res) => {
    try {
        let sessionUser = await User.getByToken(req.cookies.token);
        let user = new User(req.body);
        user.id = sessionUser.id;

        delete user.status;
        delete user.password;

        await User.updateUser(user);

        res.cookie("nickname", user.name);
        res.redirect("/account?edited=true");
    }
    catch (err) {
        return res.status(401).render("error", {
            req: req,
            errorText: err
        });
    }
});

// [GET] Просмотр аккаунта пользователя
router.get('/', loggedIn, async (req, res) => {
    let user = null;

    try {
        user = await User.getByToken(req.cookies.token);
    } catch (err) {
        return res.status(401).render("error", {
            req: req,
            errorText: err
        });
    }

    res.render("account/index", { req: req, user: user, isEdited: req.query.edited });
});

// [GET] Изменение аккаунта пользователя
router.get('/edit', loggedIn, async (req, res) => {
    let user = null;

    try {
        user = await User.getByToken(req.cookies.token);
    } catch (err) {
        return res.status(401).render("error", {
            req: req,
            errorText: err
        });
    }

    res.render("account/edit", { req: req, user: user, isEdited: req.query.edited });
});

// [GET] Завершение сессии
router.get('/logout', loggedIn, async (req, res) => {
    res.render("forms/submit", {
        req: req,
        formTopic: "Вы действительно хотите выйти?",
        submitText: "Да, я действительно хочу выйти.",
        backHref: "/account"
    });
});



module.exports = router;