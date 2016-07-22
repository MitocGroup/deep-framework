/**
 * Created by AlexanderC on 6/25/15.
 */

'use strict';

import Joi from 'joi';

let UUID_REGEXP = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Fixes weird joi exception!
 *
 * @param {Object} proto
 * @returns {Object}
 * @private
 */
function _joiVector(proto) {
  let arr = Joi.array();

  if (arr.includes) {
    return arr.includes(proto);
  }

  return arr.items(proto);
}

export default (typeof window !== 'undefined' ? {
  types: {
    uuid: function() {
      return Joi.string().regex(UUID_REGEXP);
    },

    timeUUID: function() {
      return Joi.string().regex(UUID_REGEXP);
    },

    stringSet: function() {
      return _joiVector(Joi.string());
    },

    numberSet: function() {
      return _joiVector(Joi.number());
    },

    binarySet: function() {
      return _joiVector(Joi.string());
    },
  },
} : require('vogels'));
