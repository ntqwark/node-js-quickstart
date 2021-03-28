const router = require('express').Router();

const { renderPage } = require("../helpers/page.renderer.js");

//

router.get('/', async (req, res) => {
    res.send(renderPage('', req));
});

module.exports = router;