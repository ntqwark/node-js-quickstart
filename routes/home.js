const router = require('express').Router();
module.exports = router;
module.exports.routeName = "/";

/*
 * Отрисовка таблицы
 * 
let headlines = [ "Имя", "Фамилия", "Деньги" ];
    let rows = [
        { name: "Иван", lastname: "Котов", money: "$100" },
        { name: "Иван 2", lastname: "Котов 2", money: "$100" },
        { name: "Иван 3", lastname: "Котов 3", money: "$100" }
    ]

    res.render("forms/table", {
        req: req,
        tablename: "Для теста",
        headlines: headlines,
        rows: rows
    });
*/

router.get('/', async (req, res) => {
    res.render("index", { req: req });
});

module.exports = router;