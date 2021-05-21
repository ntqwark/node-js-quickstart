const config = require("./config/config.js");
const { promises: fs } = require("fs");

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const handlebars = require('express-handlebars');

const app = express();

app.engine(
    'handlebars',
    handlebars({ defaultLayout: 'main' })
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



