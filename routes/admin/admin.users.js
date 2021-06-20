const router = require('express').Router();
module.exports = router;
module.exports.routeName = "/admin/users";

const User = require("../../models/user.model.js");
const Auth = require("../../models/auth.model.js");

const { log } = require("../../helpers/todb.logger.js");
const { renderPage, renderError, renderForm, renderMessage } = require("../../helpers/page.renderer.js");
const { unauthorizedOnly, loggedIn } = require("../../helpers/auth.middleware.js");

const sortFunc = `
    document.addEventListener('DOMContentLoaded', () => {

        const getSort = ({ target }) => {
            const order = (target.dataset.order = -(target.dataset.order || -1));
            const index = [...target.parentNode.cells].indexOf(target);
            const collator = new Intl.Collator(['en', 'ru'], { numeric: true });
            const comparator = (index, order) => (a, b) => order * collator.compare(
                a.children[index].innerHTML,
                b.children[index].innerHTML
            );
            
            for(const tBody of target.closest('table').tBodies)
                tBody.append(...[...tBody.rows].sort(comparator(index, order)));

            for(const cell of target.parentNode.cells)
                cell.classList.toggle('sorted', cell === target);
        };
        
        document.querySelectorAll('.sortable thead').forEach(tableTH => tableTH.addEventListener('click', () => getSort(event)));
        
    });
`;

// 

function doLog(adminId, prevState, newState)
{
    let diffOld = new Object();
    let diffNew = new Object();

    for (key in prevState) {
        if (prevState[key] != newState[key]) {
            diffOld[key] = prevState[key];
            diffNew[key] = newState[key];
        }
    }

    delete diffOld.lastedit;
    delete diffOld.created;

    delete diffNew.lastedit;
    delete diffNew.created;

    delete diffNew.role;
    delete diffOld.role;

    log(adminId, `Admin (id ${adminId}) changed profile data of User (id ${prevState.id}).\n
        Previous values of changed fields: ${JSON.stringify(diffOld)}\n
        New values of changed fields: ${JSON.stringify(diffNew)}`);
}

router.post("/edit", loggedIn, async (req, res) => {
    try {
        let sessionUser = await User.getByToken(req.cookies.token);
        let user = new User(req.body);
        user.id = req.query.id;

        if (sessionUser.status <= user.status && sessionUser.id != user.id)
            return res.send(renderError("Ошибка", "Вы не можете изменить данные этого аккаунта", req));

        delete user.password;

        let prevState = await User.getById(user.id);
        await User.updateUser(user);
        let newState = await User.getById(user.id);

        doLog(sessionUser.id, prevState, newState);
        res.redirect(`/admin/users/edit?id=${req.query.id}&edited=true`);
    }
    catch (err) {
        return res.status(401).render("error", {
            req: req,
            errorText: err
        });
    }
});

router.get('/', async (req, res) => {
    let users = null;

    try { users = await User.getAllUsers(); }
    catch (err) {
        return res.status(401).render("error", {
            req: req,
            errorText: err
        });
    }

    res.render("admin/users", { req: req, users: users });
});

router.get('/edit:id?', async (req, res) => {
    let user = null;
    let sessionUser = null;

    try {
        user = await User.getById(req.query.id);
        sessionUser = await User.getByToken(req.cookies.token);
    } catch (err) {
        return res.status(401).render("error", {
            req: req,
            errorText: err
        });
    }

    if (user.status >= sessionUser.status && user.id != sessionUser.id)
        return res.send(renderError("Ошибка", "Вы не можете редактировать данные этого аккаунта", req));

    res.render("admin/users/edit", { req: req, user: user, isEdited: req.query.edited, backHref: req.query.backHref });
});

router.get("/view:id?", async (req, res) => {
    let user = null;
    let sessionUser = null;

    try {
        user = await User.getById(req.query.id);
        sessionUser = await User.getByToken(req.cookies.token);
    } catch (err) {
        return res.status(401).render("error", {
            req: req,
            errorText: err
        });
    }

    if (user.status >= sessionUser.status && user.id != sessionUser.id)
        return res.send(renderError("Ошибка", "Вы не можете просмотреть данные этого аккаунта", req));

    res.render("admin/users/view", { req: req, user: user, isEdited: req.query.edited, backHref: req.query.backHref });
})

module.exports = router;