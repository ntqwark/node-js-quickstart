const router = require('express').Router();
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
        console.log(err);
        res.status(500).send(renderError("Ошибка", err, req));
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
            res.status(500).send(renderError("Ошибка", "Пользователь с указаным email не найден", req));
        }
    }
    catch (err) {
        res.status(500).send(err);
    }
});

// Страница регистрации
router.get('/register', unauthorizedOnly, async (req, res) => {
    let html = `
        <div class="register-from">
            <form method="post">
                <div class="mb-3">
                    <label for="exampleInputEmail1" class="form-label">Email address</label>
                    <input name="email" type="email" class="form-control" aria-describedby="emailHelp">
                    <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
                </div>
                <div class="mb-3">
                    <label for="exampleInputEmail1" class="form-label">Nickname</label>
                    <input name="name" type="text" class="form-control" aria-describedby="nickname">
                </div>
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input name="password" type="password" class="form-control">
                </div>
                <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input">
                    <label name="gay" class="form-check-label">Я гей!</label>
                </div>
                <div class="buttons-group">
                    <button type="submit" class="btn btn-primary">Зарегистрироваться</button>
                </div>
            </form>
        </div>`;

    res.send(renderForm("Регистрация", html, req));
});

// Страница авторизации
router.get('/login', unauthorizedOnly, async (req, res) => {
    let html = `
        <div class="login-from">
            <form method="post">
                <div class="mb-3">
                    <label for="exampleInputEmail1" class="form-label">Email address</label>
                    <input name="email" type="email" class="form-control" aria-describedby="emailHelp">
                </div>
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input name="password" type="password" class="form-control">
                </div>
                <div class="buttons-group">
                    <button type="submit" class="btn btn-primary">Авторизироваться</button>
                </div>
            </form>
        </div>`;

    res.send(renderForm("Авторизация", html, req));
});

module.exports = router;