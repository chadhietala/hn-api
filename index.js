const restify = require('restify');
const bunyan = require('bunyan');
const WebpackResources = require('./resources.js');
const ForegroundData = require('./storage/foreground.js');

// Restify Plugins
const classifyBrowser = require('./plugins/classifyBrowser.js');
const setRequestResources = require('./plugins/setRequestResources.js');
const shrinkRay = require('shrink-ray');

// Routes
const apiList = require('./routes/api/list.js');
const apiItems = require('./routes/api/items.js');
const apiComments = require('./routes/api/comments.js');
const insecureRedirect = require('./routes/insecure.js');
const defaultRoute = require('./routes/default-serverrender.js');
const shellRoute = require('./routes/default.js');
const staticRoute = require('./routes/static.js');
const staticIconRoute = require('./routes/static-icons.js');
const serviceWorkerRoute = require('./routes/serviceWorker.js');

module.exports = class Server {
  constructor(name) {
    let logger = this.logger = bunyan.createLogger({
      name: name
    });

    this.server = restify.createServer({
      name: name,
      log: logger
    });

    this._setupMiddleWare();
  }

  /**
   * Called during setup to allow to add any custom middleware
   * to the server.
   *
   * @public
   * @param server
   * @param logger
   * @return void
   */
  addMiddleware(server, logger) {
    server.use(setRequestResources(WebpackResources(logger)));
  }

  _setupMiddleWare() {
    let { server, logger } = this;
    server.use(restify.requestLogger());
    server.use(restify.bodyParser());
    server.use(restify.queryParser());
    server.use(shrinkRay({filter: (req) => {
      return !/.js|.css/.test(req.url);
    }}));
    server.use(classifyBrowser());
    this.addMiddleWare(server, logger);
  }

  _setupRoutes() {
    let { server } = this;
    // TODO: Do not duplicate route definitions...
    // Programatically derive from a single source of truth.
    server.get('/api/list/:type', apiList.route);
    server.get('/api/items', apiItems.route);
    server.get('/api/comments/:id', apiComments.route);
    server.get('/:type/:id', insecureRedirect, this.defaultRoute());
    server.get('/shell', shellRoute);
    server.get('/dist/:classification/:file', staticRoute);
    server.get('/static/icons/:file', staticIconRoute);
    server.get('/sw.js', serviceWorkerRoute);
    server.get('/.*', insecureRedirect, this.defaultRoute());
  }

  /**
   * Allows you to setup a default route for your application.
   * This will be used for any route that the server does not
   * know how to handle.
   *
   * @return Function<route>
   */
  defaultRoute() {
    return defaultRoute;
  }

  addRoute() {
    // TODO
  }

  /**
   * Starts the server.
   *
   * @param port
   * @return void
   */
  listen(port = 22164) {
    let { server } = this;

    ForegroundData.init();

    server.listen(22164, function() {
      console.log('%s listening at %s', server.name, server.url);
    });
  }
}
