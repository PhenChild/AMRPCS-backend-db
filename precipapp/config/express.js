/* 
 Configuracion express
 */

const createError = require('http-errors')
const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')

const logger = require('morgan')
var methodOverride = require('method-override');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
// var permission = require('../app/utils/permission');

module.exports = () => {
    const limiter = rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        keyGenerator: function (req /*, res*/) {
            let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.headers['x-real-ip'] || req.ip;
            console.log(ip)
            return ip;
        }
    }); //protege contra ataques de fuerza bruta
    var app = express();
    // view engine setup
    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'pug')
    app.use(methodOverride());
    app.use(cors())

    app.set('trust proxy', 1);
    app.use(helmet());// ayuda a proteger la aplicación de algunas vulnerabilidades web conocidas mediante el establecimiento correcto de cabeceras HTTP.
    app.use(limiter);
    app.use(express.json({ limit: '50mb' }))
    app.use(express.urlencoded({ extended: false }))//true?
    app.use(cookieParser())
    app.use(express.static(path.join(__dirname, 'public')))

    app.use(express.static('public'));
    app.use('/images', express.static('assets/images'));//?

    app.use(function (req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept'
        )
        next()
    })

    app.get('/', (req, res) => {
        res.send('Hello!')
    })

    // app.use(permission.checkToken);
    /* var loginRoute = require('../app/routes/login.server.route');
    loginRoute(app);
    const userRoute = require('../app/routes/user.server.route');
    userRoute(app);
    const roleRoute = require('../app/routes/role.server.route');
    roleRoute(app);
    const cropsRoute = require('../app/routes/crops/crops.server.route');
    cropsRoute(app);
    const resourceRoute = require('../app/routes/resources/resource.server.route');
    resourceRoute(app);
    const resourceRoleRoute = require('../app/routes/resources/resourceRole.server.route');
    resourceRoleRoute(app);
    const logseController = require('../app/routes/logs/logs.server.route');
    logseController(app);
    app.use('/api/users', usersRouter)
    app.use('/api/auth', authRouter) */

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404))
    })

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message
        res.locals.error = req.app.get('env') === 'development' ? err : {}

        // render the error page
        res.status(err.status || 500)
        res.render('error')
    })

    return app;
};

