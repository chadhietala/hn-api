#Hackernews API

This is a more generalized extraction of the Hackernews Preact app for others to use.

## Basic Usage

```
const Server = require('hackernews-api');
const server = new Server('preact-hn');

server.listen();
```

## Configurable Usage

```
const Server = require('hackernews-api');

class MyServer extends Server {
  defaultRoute() {
    return function(req, res, next) {
      res.write(`<!DOCTYPE html>
        <html>
        <head>
          <title>Default Route</title>
        </head>
          <body>
            <h1>Hello World</h1>
          </body>
        </html>
      `)
    }
  }

  addMiddleware(server, logger) {
    logger.info('adding some middleware');
    server.use(myCustomMiddleWare());
  }
}

const server = new MyServer('my-server');

server.listen(4200);
```
