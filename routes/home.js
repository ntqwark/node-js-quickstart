const router = require('express').Router();
module.exports = router;
module.exports.routeName = "/";

const { renderFull } = require("../helpers/page.renderer.js");

// 

function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

router.get('/', async (req, res) => {
    let gay = randomInteger(0, 101);
    let html = '';

    if (gay != 101)
        html = `<a href="/" style="font-size:${10+gay}px; text-decoration: none; color: black;">ТЫ ГЕЙ НА ${gay}%</a>`;
    else
        html = `<a href="/" style="font-size:228px; text-decoration: none; color: black;">ТЫ ГЕЙЛОРД</a>`;

    res.render("index", { req: req });
});

module.exports = router;