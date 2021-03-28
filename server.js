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



// Импорт маршрутов
const authRoute = require('./routes/auth');
const homeRoute = require('./routes/home');



// Применение маршрутизации

// Маршрутизация авторизации и регистрации
app.use('/', authRoute);
// Маршрутизация главной страницы
app.use('/', homeRoute);



app.use('/admin', adminOnly, (req, res) => { res.send('hello admin!'); });

app.use('/account', loggedIn, (req, res) => { res.send('hello user!'); });

app.listen(8000, () => console.log('Server is running'));

