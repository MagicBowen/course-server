const Koa = require('koa');
const Router  = require('koa-router');
const session = require('koa-session');
const convert = require('koa-convert');
const bodyParser = require('koa-bodyparser');
const controller = require('./controller');
const templating = require('./templating');
const staticFiles = require('./static-files');
const logger = require('./logger').logger('server');

///////////////////////////////////////////////////////////
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;
const host = process.env.PORT || '127.0.0.1';

///////////////////////////////////////////////////////////
const app = new Koa();
app.keys = ['superupersessionsecret'];
app.use(convert(session(app)))

///////////////////////////////////////////////////////////
// log middleware
app.use(async (ctx, next) => {
    logger.info(`process request for '${ctx.request.method} ${ctx.request.url}' ...`);
    var start = new Date().getTime();
    await next();
    var execTime = new Date().getTime() - start;
    ctx.response.set('X-Response-Time', `${execTime}ms`); 
    logger.info(`... response in duration ${execTime}ms`);
});

///////////////////////////////////////////////////////////
// deal static files:
app.use(staticFiles('/static/', __dirname + '/static'));
// parse request body:
app.use(bodyParser());
// add nunjucks as view:
app.use(templating('views', {
    noCache: !isProduction,
    watch: !isProduction
}));
// add controllers:
app.use(controller());

///////////////////////////////////////////////////////////
// Catch unhandled exceptions
process.on('uncaughtException',function(err){
    logger.error('uncaughtException-->'+err.stack+'--'+new Date().toLocaleDateString()+'-'+new Date().toLocaleTimeString());
    process.exit();
});

///////////////////////////////////////////////////////////
app.listen(port, host);
logger.info(`Server is running on ${host}:${port}...`);