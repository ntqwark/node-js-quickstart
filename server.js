const config = require("./config/config.js");

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(cookieParser(config.COOKIES_SECRET));

app.use(bodyParser.urlencoded({
    extended: true
}));

const { loggedIn, adminOnly, unauthorizedOnly } = require("./helpers/auth.middleware.js");
const { renderPage, renderMessage, renderError } = require("./helpers/page.renderer.js");


// Импорт маршрутов
const authRoute = require('./routes/auth');
const homeRoute = require('./routes/home');
const accountRoute = require('./routes/account');

const adminRoute = require('./routes/admin');
const adminUsersRoute = require('./routes/admin.users')


// Применение маршрутизации

// Маршрутизация авторизации и регистрации
app.use('/', authRoute);
// Маршрутизация главной страницы
app.use('/', homeRoute);
// Маршрутизация страницы об аккаунте
app.use('/account', loggedIn, accountRoute);
// Маршрутизация страниц администрирования
app.use('/admin', adminOnly, adminRoute);

app.use('/admin/users', adminOnly, adminUsersRoute);


app.listen(8000, () => console.log('Server is running'));

