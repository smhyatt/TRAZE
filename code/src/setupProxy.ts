const { createProxyMiddleware } = require('http-proxy-middleware');
// Proxy servers are powerful because they act as middlemen,
// communicating your needs and requests without providing
// your information to the internet. Proxies can also allow
// you to bypass certain security blocks and allow you to access
// information that might otherwise be blocked. This is made
// possible through use of a proxy server that does not reveal
// your personal IP address.
// source: https://blog.logrocket.com/how-a-proxy-server-works-in-node-js/


// Create and export Proxy on localhost for the test port 3003.
module.exports = app => {
  app.use(
    // The one-liner node.js proxy middleware for connect, express and browser-sync.
    createProxyMiddleware(['/api/**'], {
      target: 'http://localhost:3003', 
    }),
  );
};
