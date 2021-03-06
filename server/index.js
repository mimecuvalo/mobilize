import apiServer from './api/api';
import apolloServer from './data/apollo';
import appServer from './app/app';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import express from 'express';
import path from 'path';
import session from 'express-session';
import sessionFileStore from 'session-file-store';
import winston from 'winston';
import WinstonDailyRotateFile from 'winston-daily-rotate-file';

const FileStore = sessionFileStore(session);

// Called from scripts/serve.js to create the three apps we currently support: the main App, API, and Apollo servers.
export default function constructApps({ appName, productionAssetsByType, publicUrl, gitInfo }) {
  const app = express.Router();

  // Add basics: gzip, body parsing, cookie parsing.
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());

  // Session store.
  // NOTE! We use a file storage mechanism which keeps things simple for purposes of ubiquity of this CRA package.
  // However, I recommend using `connect-redis` for a better session store.
  const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days.
  const sessionsSecret =
    process.env.REACT_APP_SESSION_SECRET || (process.env.NODE_ENV === 'development' ? 'dumbsecret' : null);
  app.use(
    session({
      store: new FileStore({ ttl: SESSION_MAX_AGE, logFn: () => {} }),
      secret: sessionsSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: SESSION_MAX_AGE * 1000 /* milliseconds */,
      },
    })
  );

  // Add XSRF/CSRF protection.
  const csrfMiddleware = csurf({
    cookie: {
      path: '/',
      httpOnly: true,
      secure: false,
    },
  });

  // Set up API server.
  apiServer && app.use('/api', csrfMiddleware, apiServer({ appName }));

  // Set up Apollo server.
  apolloServer && apolloServer(app);

  const dispose = () => {}; // Use this function in case you need to cleanup state before an HMR refresh.

  // Create logger for app server to log requests.
  const appLogger = createLogger();

  // Our main request handler that kicks off the SSR, using the appServer which is compiled from serverCompiler.
  // `res` has the assets (via webpack's `stats` object) from the clientCompiler.
  app.get('/*', csrfMiddleware, (req, res, next) => {
    logRequest(appLogger, req, req.info || req.connection);
    const assetPathsByType =
      process.env.NODE_ENV === 'development' ? processAssetsFromWebpackStats(res) : productionAssetsByType;
    appServer({ req, res, next, assetPathsByType, appName, publicUrl, gitInfo });
  });

  return [app, dispose];
}

// Sets up winston to give us request logging on the main App server.
function createLogger() {
  return winston.createLogger({
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [
      new WinstonDailyRotateFile({
        name: 'app',
        filename: path.resolve(process.cwd(), 'logs', 'app-%DATE%.log'),
        zippedArchive: true,
      }),
    ],
  });
}

function logRequest(appLogger, req, connection) {
  appLogger.info({
    id: req.id,
    method: req.method,
    url: req.url,
    headers: req.headers,
    remoteAddress: connection?.remoteAddress,
    remotePort: connection?.remotePort,
  });
}

// This magic function lets us extract the list of CSS/JS generated from webpack so
// that our server-side rendering can be complete. We take this list of assets and pass them to
// HTMLHead/HTMLBase.
// This is possible since we set `serverSideRender: true` in serve.js which sets res.locals.webpackStats.
function processAssetsFromWebpackStats(res) {
  const webpackStats = res.locals.webpackStats.toJson();
  const extensionRegexp = /\.(css|js)(\?|$)/;
  const entrypoints = Object.keys(webpackStats.entrypoints);
  const assetDuplicateCheckMap = {};
  const assetPathsByType = {
    css: [],
    js: [],
  };
  for (const entrypoint of entrypoints) {
    for (const assetPath of webpackStats.entrypoints[entrypoint].assets) {
      const extMatch = extensionRegexp.exec(assetPath);
      if (!extMatch) {
        continue;
      }

      const publicPath = webpackStats.publicPath + assetPath;
      if (assetDuplicateCheckMap[publicPath]) {
        continue;
      }

      assetDuplicateCheckMap[publicPath] = true;
      const extension = extMatch[1];
      assetPathsByType[extension].push(publicPath);
    }
  }

  return assetPathsByType;
}
