/**
 * Created by vcernomschi on 11/16/15.
 */

'use strict';

/**
 * Raven Mock
 */
export default  {
  Client: function() {
    return {
      logs: [],

      captureMessage: function(message, options, callback) {
        this.logs.push(arguments);

        return {
          message: message,
          options: options,
          callback: callback,
        };
      },

      captureError: function(error, options, callback) {
        this.logs.push(arguments);

        return {
          error: error,
          options: options,
          callback: callback,
        };
      },

      captureQuery: function(query, type, callback) {
        this.logs.push(arguments);

        return {
          query: query,
          type: type,
          callback: callback,
        };
      },
    };
  },

  config: function() {
    return this;
  },

  install: function() {
    return this;
  },
};
