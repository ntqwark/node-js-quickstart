const config = require("./config/config.js");
const { promises: fs } = require("fs");

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const handlebars = require('express-handlebars');

const app = express();
const email = require("./helpers/email.sender");
const { create } = require("domain");

app.engine(
    'handlebars',
    handlebars({
        defaultLayout: 'main',
        helpers: {
            createPagesList: function (page, maxPage = 10000) {
                page = parseInt(page);

                var pages = [];
                var result = "";

                if (page == 1) {
                    for (let i = 1; i < 4; i++) {
                        if (i == page) result += `<a class="page" style="color: black" href="/admin/log?page=${i}"><b>${i}</b></a>`;
                        else result += `<a class="page" style="color: black" href="/admin/log?page=${i}">${i}</a>`;
                    }
                } else {
                    for (let i = page - 1; i < page + 2; i++) {
                        if (i == page) result += `<a class="page" style="color: black" href="/admin/log?page=${i}"><b>${i}</b></a>`;
                        else result += `<a class="page" style="color: black" href="/admin/log?page=${i}">${i}</a>`;
                    }
                }

                return `<div class="page-selector">${result}</div>`
            }
        }
    })
);

app.set('views', './views');
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(cookieParser(config.COOKIES_SECRET));

app.use(bodyParser.urlencoded({
    extended: true
}));


// Применение маршрутизации

async function initializeRoutes(directory = './routes') {
    let count = 0;

    try {
        let files = await fs.readdir(directory);

        for (file of files) {
            let stat = await fs.stat(`${directory}/${file}`);

            if (stat.isDirectory()) {
                count += await initializeRoutes(`${directory}/${file}`);
            } else if (stat.isFile()) {
                let route = require(`././${directory}/${file}`);
                app.use(route.routeName, route);

                count++;
            }
        }
    } catch (e) {
        console.log("Error on routes initializing:")
        console.error(e);
    }

    return count;
}

async function main() {
    let routesCount = await initializeRoutes();
    console.log(`Successfully loaded ${routesCount} routes.`);

    app.listen(config.APP_PORT, () => console.log(`Server is running on ${config.APP_PORT}`));
}

main();



