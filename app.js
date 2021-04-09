const  fs = require('fs'),
    util = require('util'),
    http = require('http'),
    serializejs = require('serialize-javascript')
    commandLineArgs = require('command-line-args')

const optionDefinitions = [
    { name: 'config', alias: 'c', type: String, defaultValue: __dirname + '/config.json' },
];

const options = commandLineArgs(optionDefinitions);

require('reflect-metadata')

global.Promise = require('bluebird')

Promise.config({
    warnings: {
        wForgottenReturn: false
    }
});


global.station = {
    rootDir: __dirname,
    config: require('object-assign-deep')({}, require('./config.json'), require(options.config)),
    models: [],
    modules: [],
    db: null,
    log(obj) {
        if (obj instanceof ErrorMessage) return;
        console.log(obj);
    },
    async run() {
        let Express = require('express');
        global.app = Express();

        this.utils = require('./utility');

        app.use(Express.static(__dirname + "/static", {maxAge: '1y'}));

        app.set('view engine', 'ejs');

        // Use body parser
        let bodyParser = require('body-parser');
        app.use(bodyParser.urlencoded({
            extended: true,
            limit: '50mb'
        }));
        app.use(bodyParser.json({ limit: '50mb' }));

        // Use cookie parser
        app.use(require('cookie-parser')());
        app.locals.serializejs = serializejs;

        let multer = require('multer');
        app.multer = multer({ dest: station.utils.resolvePath(station.config.upload_dir, 'tmp') });


        this.loadHooks();
        app.server = http.createServer(app)

        await this.connectDatabase();
        this.loadModules();

        app.server.listen(parseInt(station.config.port), station.config.hostname, () => {
            this.log(`Station is listening on ${station.config.hostname}:${parseInt(station.config.port)}...`);
        });
    },
    async connectDatabase() {
        const TypeORMMysqlDriver = require('typeorm/driver/mysql/MysqlDriver');
        const OriginalNormalizeType = TypeORMMysqlDriver.MysqlDriver.prototype.normalizeType;
        TypeORMMysqlDriver.MysqlDriver.prototype.normalizeType = function (column) {
            if (column.type === 'json') {
                return 'longtext';
            }
            return OriginalNormalizeType(column);
        };

        const TypeORM = require('typeorm');
        global.TypeORM = TypeORM;

        const modelsPath = __dirname + '/models/';
        const modelsBuiltPath = __dirname + '/models-built/';
        const models = fs.readdirSync(modelsPath)
            .filter(filename => filename.endsWith('.ts') && filename !== 'common.ts')
            .map(filename => require(modelsBuiltPath + filename.replace('.ts', '.js')).default);

        await TypeORM.createConnection({
            type: 'mariadb',
            host: this.config.db.host.split(':')[0],
            port: this.config.db.host.split(':')[1] || 3306,
            username: this.config.db.username,
            password: this.config.db.password,
            database: this.config.db.database,
            entities: models,
            synchronize: true,
            logging: false,
            extra: {
                connectionLimit: 50
            }
        });
    },
    loadModules() {
        fs.readdir(__dirname + '/modules/', (err, files) => {
            if (err) {
                this.log(err);
                return;
            }
            files.filter((file) => file.endsWith('.js'))
                .forEach((file) => this.modules.push(require(`./modules/${file}`)));
        });
    },
    lib(name) {
        return require(`./libs/${name}`);
    },
    model(name) {
        return require(`./models-built/${name}`).default;
    },
    loadHooks() {

        app.use((req, res, next) => {
            res.locals.useLocalLibs = !!parseInt(req.headers['syzoj-no-cdn']) || station.config.no_cdn;

            let User = station.model('user');
            if (req.cookies.user_id) {
                User.findById(req.cookies.user_id).then((user) => {
                    res.locals.user = user;
                    next();
                }).catch((err) => {
                    this.log(err);
                    res.locals.user = null;
                    req.cookies.user_id = null;
                    next();
                });
            } else {
                if (req.cookies.login) {
                    let obj;
                    try {
                        obj = JSON.parse(req.cookies.login);
                        User.findOne({
                            where: {
                                user_number: obj[0],
                                password: obj[1]
                            }
                        }).then(user => {
                            if (!user) throw null;
                            res.locals.user = user;
                            req.cookies.user_id = user.id;
                            next();
                        }).catch(err => {
                            console.log(err);
                            res.locals.user = null;
                            req.cookies.user_id = null;
                            next();
                        });
                    } catch (e) {
                        res.locals.user = null;
                        req.cookies.user_id = null;
                        next();
                    }
                } else {
                    res.locals.user = null;
                    req.cookies.user_id = null;
                    next();
                }
            }
        });

        // Active item on navigator bar
        app.use((req, res, next) => {
            res.locals.active = req.path.split('/')[1];
            next();
        });

        app.use((req, res, next) => {
            res.locals.req = req;
            res.locals.res = res;
            next();
        });
    }
}

station.untilStarted = station.run();