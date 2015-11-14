'use strict';

/**
 * Raven Mock
 */
export default  {
  Client: function(dsn) {
    return {
      logs: [],

      captureMessage: function(message, options, callback) {
        this.logs.push(arguments);

        return {
          message: message,
        };
      },

      captureError: function(error, options, callback) {
        this.logs.push(arguments);

        return {
          error: error,
        };
      },

      captureQuery: function(query, type, callback) {
        this.logs.push(arguments);

        return {
          query: query,
        };
      },
    };
  },

  config: function() {

  },

  install: function() {

  },
};
