import { F } from '../../shared/i18n';
import HTMLHead from './HTMLHead';
import React from 'react';

// The main wrapper around all of our app's code.
// It's React all the way down!
export default function HTMLBase({
  apolloStateFn,
  appTime,
  appVersion,
  assetPathsByType,
  children,
  csrfToken,
  defaultLocale,
  locale,
  nonce,
  publicUrl,
  req,
  title,
  user,
}) {
  return (
    <html lang={locale}>
      <HTMLHead assetPathsByType={assetPathsByType} nonce={nonce} publicUrl={publicUrl} req={req} title={title} />
      <body>
        <div id="root">{children}</div>
        <ConfigurationScript
          appTime={appTime}
          appVersion={appVersion}
          csrfToken={csrfToken}
          defaultLocale={defaultLocale}
          locale={locale}
          nonce={nonce}
          user={user}
        />
        <WindowErrorScript nonce={nonce} />

        {/*
          TODO(mime): This would be blocked by a CSP policy that doesn't allow inline scripts.
          Try to get a nonce here instead.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__APOLLO_STATE__ = ${JSON.stringify(apolloStateFn()).replace(/</g, '\\u003c')};`,
          }}
        />

        {assetPathsByType['js'].map(path => (
          <script nonce={nonce} key={path} src={path} />
        ))}

        {/*
          This HTML file is a template.
          If you open it directly in the browser, you will see an empty page.

          You can add webfonts, meta tags, or analytics to this file.
          The build step will place the bundled scripts into the <body> tag.

          To begin the development, run `npm start` or `yarn start`.
          To create a production bundle, use `npm run build` or `yarn build`.
        */}

        <noscript>
          <F msg="You need to enable JavaScript to run this app." />
        </noscript>
      </body>
    </html>
  );
}

// Passes key initial, bootstrap data to the client.
function ConfigurationScript({ appTime, appVersion, csrfToken, defaultLocale, locale, nonce, user }) {
  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `
          window.configuration = {
            appTime: ${appTime},
            appVersion: '${appVersion}',
            auth0_client_id: '${process.env.REACT_APP_AUTH0_CLIENT_ID}',
            auth0_domain: '${process.env.REACT_APP_AUTH0_DOMAIN}',
            csrf: '${csrfToken}',
            defaultLocale: '${defaultLocale}',
            locale: '${locale}',
            user: ${JSON.stringify(user)},
          };
        `,
      }}
    />
  );
}

// If there is an error that occurs upon page load, i.e. when executing the initial app code,
// then we send the error up to the server via this mechanism.
// Once the app is loaded, then the rest of error reporting goes through error.js -> logError.
function WindowErrorScript({ nonce }) {
  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `
        var hasGlobalErrorFired = false;
        window.onerror = function(message, file, line, column, error) {
          if (hasGlobalErrorFired) {
            return;
          }
          hasGlobalErrorFired = true;

          var data = {
            random: Math.random(),
            context: navigator.userAgent,
            message: message,
            file: file,
            line: line,
            column: column,
            url: window.location.href
          };
          var img = new Image();
          img.src = '/api/report-error?data=' + encodeURIComponent(JSON.stringify(data));
        };`,
      }}
    />
  );
}
