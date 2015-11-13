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
          message,
        };
      },

      captureError: function(error, options, callback) {
        this.logs.push(arguments);

        return {
          error,
        };
      },

      captureQuery: function(query, type, callback) {
        this.logs.push(arguments);

        return {
          query,
        };
      },
    };
  },
};
