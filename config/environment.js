/* eslint-env node */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'roundware',
    environment: environment,
    rootURL: '/',
    locationType: 'hash',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      API_NAMESPACE: 'api/v2'
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.APP.API_HOST = 'http://192.168.1.64:8888';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  ENV['ember-simple-auth'] = {
    authorizer: 'authorizer:token'
  };

  ENV['ember-simple-auth-token'] = {
    serverTokenRefreshEndpoint: ENV.APP.API_HOST + '/api/2/auth/token/',
    serverTokenEndpoint: ENV.APP.API_HOST + '/api/2/auth/login/',
    refreshAccessTokens: true,
    refreshLeeway: 300,
    authorizationPrefix: 'jwt ',

    // headers: {'Accept': 'application/json'}
    //   text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'} , 'Content-Type': 'multipart/form-data'}
  };

  return ENV;
};
