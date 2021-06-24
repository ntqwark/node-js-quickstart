const router = require('express').Router();
module.exports = router;
module.exports.routeName = "/admin";

const User = require("../../models/user.model.js");
const Auth = require("../../models/auth.model.js");
const sql = require("../../models/db.js");

const { renderPage, renderError, renderForm, renderMessage } = require("../../helpers/page.renderer.js");
const { loggedIn, adminOnly, unauthorizedOnly } = require("../../helpers/auth.middleware");

const usersRoute = require('./admin.users.js');

const moment = require("moment");
moment.locale("ru");

// 

router.get('/', adminOnly, async (req, res) => {
    res.render("admin/index", { req: req });
})

router.get('/raw-log:id?', adminOnly, async (req, res) => {
    try {
        let rows = await sql.query("SELECT * FROM actions WHERE actionid = ?", req.query.id);
        let log = rows[0];

        res.render("admin/rawlog", {
            req: req,
            body: JSON.stringify(log),
            backHref: "/admin/log"
        });

    } catch (err) {
        res.status(401).render("error", {
            req: req,
            errorText: err
        });
    }
})

router.get('/log:page?', adminOnly, async (req, res) => {
    // Определение максимального номера и текущего номера страницы
    let rows = await sql.query("SELECT MAX(actionid) 'id' FROM actions");
    let pagesCount = Math.ceil(rows[0].id / 15);

    if (!req.query.page) req.query.page = pagesCount - 1;
    else { req.query.page--; }

    // Запрос данных из БД
    let actions = await sql.query(`
        SELECT actionid, name, actiondesk, actiondate, id FROM actions action
        INNER JOIN users user ON action.userid = user.id
        WHERE actionid > ${req.query.page * 15} LIMIT 15`);

    // Проход в цикле по всем элементам массива
    let i = 0;
    for (let t in actions) {
        let action = actions[i++];
        action.actionid = `<a href="/admin/raw-log?id=${action.actionid}&backHref=admin/log">${action.actionid}</a>`;
        action.name = `<a href="/admin/users/view?id=${action.id}&backHref=admin/log?page=${req.query.page + 1}">${action.name}</a>`;
        action.actiondate = `${moment(action.actiondate).format("LLL")} (${moment(action.actiondate).fromNow()})`;
        delete action["id"];
    }

    // Заголовок таблицы
    let headlines = ["ID", "User", "Action", "Date"];

    // Отрисовка таблицы
    res.render("forms/table", {
        req: req,
        tablename: "Журнал событий",
        headlines: headlines,
        rows: actions,
        page: req.query.page + 1
    });
})

module.exports = router;