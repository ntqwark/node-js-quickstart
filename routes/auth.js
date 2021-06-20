const router = require('express').Router();
module.exports = router;
module.exports.routeName = "/";

const bcrypt = require('bcrypt');

const User = require("../models/user.model.js");
const Auth = require("../models/auth.model.js");
const config = require("../config/config");

const { renderForm, renderMessage, renderError } = require("../helpers/page.renderer.js");
const { unauthorizedOnly, loggedIn } = require("../helpers/auth.middleware.js");
const { log } = require("../helpers/todb.logger.js");

async function proceedAuth(req, res, user) {
    let session = await Auth.createSession(user);

    res.cookie("token", session);
    req.cookies.token = session;

    if (user.status > 10) {
        req.cookies.admin = true;
        res.cookie("admin", "true");
    }

    res.cookie("nickname", user.name);
}

// Регистрация подьзователей
router.post('/register', unauthorizedOnly, async (req, res) => {
    if (req.body == undefined || req.body.password == undefined)
        return res.status(500).send(renderError('Ошибка', 'Bad request', req));

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hasPassword = await bcrypt.hash(req.body.password, salt);

    // Создание объекта пользователя
    const user = new User({
        email: req.body.email,
        name: req.body.name,
        password: hasPassword,
        status: req.body.status || 1
    });

    // Сохранение пользователя в базу данных
    try {
        const id = await User.create(user);
        user.id = id;
        delete user.password;

        await proceedAuth(req, res, user);

        res.render("forms/message", {
            req: req,
            formTopic: "Вы успешно зарегистрировались",
            submitText: "ОК",
            backHref: "/",
            formAction: "/account"
        });
    } catch (err) {
        return res.status(401).render("error", {
            req: req,
            errorText: err
        });
    }
});

// Авторизация пользователей
router.post("/login", unauthorizedOnly, async (req, res) => {
    try {
        // Запрос пользователя из БД
        const user = await User.getByEmail(req.body.email);
        
        if (user) {
            // Если пользователь найден

            // Проверка пароля
            const validPass = await bcrypt.compare(req.body.password, user.password);
            if (!validPass) return res.status(400).render("forms/message", {
                                        req: req,
                                        formTopic: "Вы ввели неправильный пароль",
                                        submitText: "ОК",
                                        backHref: "/",
                                        formAction: "/login"
                                    });

            await proceedAuth(req, res, user);

            res.render("forms/message", {
                req: req,
                formTopic: "Вы успешно авторизировались",
                submitText: "ОК",
                backHref: "/",
                formAction: "/account"
            });
        } else {
            return res.status(400).render("forms/message", {
                req: req,
                formTopic: "Пользователь с указаной почтой не найден",
                submitText: "ОК",
                backHref: "/",
                formAction: "/login"
            });
        }
    }
    catch (err) {
        return res.status(401).render("error", {
            req: req,
            errorText: err
        });
    }
});

// Страница регистрации
router.get('/register', unauthorizedOnly, async (req, res) => {
    res.render("auth/register", { req: req });
});

// Страница авторизации
router.get('/login', unauthorizedOnly, async (req, res) => {
    res.render("auth/login", { req: req });
});