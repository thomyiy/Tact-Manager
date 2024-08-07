const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const dotenv = require('dotenv');
dotenv.config({path: __dirname+"/config.env"});

const express = require('express');
const app = express();
const path = require('path');
const pageRouter = require('./routes/routes');
const formationRouter = require('./routes/formationRoutes');
const userRouter = require('./routes/userRoutes');
const teamRouter = require('./routes/teamRoutes');
const sportRouter = require('./routes/sportRoutes');
const schoolRouter = require('./routes/schoolRoutes');



const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const upload = require('express-fileupload');

const flash = require("connect-flash");
var i18n = require("i18n-express");
var bodyParser = require('body-parser');
const expressPartials = require('express-partials');


var urlencodeParser = bodyParser.urlencoded({extended: true});
app.use(urlencodeParser);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(upload());

app.use(express.json());
app.use(session({resave: false, saveUninitialized: true, secret: 'nodedemo'}));
app.use(cookieParser());
// app.use(expressPartials({}));
app.set('layout', 'layout/layout-vertical');
app.use(expressLayouts);
app.use(flash());

app.use(express.static(__dirname + '/public'));

/* ---------for Local database connection---------- */
const DB = process.env.DATABASE_LOCAL;
mongoose.connect(DB, {
    useNewUrlParser: true
}).then((con) => console.log("DB connection successfully..!"));

// for i18 usr
app.use(i18n({
    translationsPath: path.join(__dirname, 'i18n'), // <--- use here. Specify translations files path.
    siteLangs: ["ch", "en", "fr", "ru", "it", "gr", "sp", "ar"],
    textsVarName: 'translation'
}));

app.use((err, req, res, next) => {
    let error = {...err}
    if (error.name === 'JsonWebTokenError') {
        err.message = "please login again";
        err.statusCode = 401;
        return res.status(401).redirect('view/login');
    }
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'errors';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,

    })
});

// Define All Route
pageRouter(app);
formationRouter(app);
userRouter(app);
teamRouter(app);
sportRouter(app);
schoolRouter(app);
app.all('*', function (req, res) {
    res.locals = {title: 'Error 404'};
    res.render('auth-404', {layout: "layout/layout"});
});

const http = require("http").createServer(app);
http.listen(process.env.PORT, () => console.log(`http://localhost:${process.env.PORT}/ Server running on port ${process.env.PORT}`));


//const test = require("./test/test");
//test();
