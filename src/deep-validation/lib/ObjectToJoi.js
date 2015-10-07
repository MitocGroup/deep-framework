/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import {Joi as JoiHelper} from './Helpers/Joi';
import {InvalidSchemaException} from './Exception/InvalidSchemaException';

/**
 * Exporting simple object to joi
 */
export class ObjectToJoi {
  /**
   * @param {Object} baseObject
   */
  constructor(baseObject) {
    this._baseObject = baseObject;
  }

  /**
   * @returns {Object}
   */
  get baseObject() {
    return this._baseObject;
  }

  /**
   * @returns {Object}
   */
  transform() {
    try {
      return ObjectToJoi._transform(this._baseObject);
    } catch (e) {
      throw new InvalidSchemaException(this._baseObject, e);
    }
  }

  /**
   * @param {Object} obj
   * @returns {Object}
   * @private
   */
  static _transform(obj) {
    let transObj = {};

    for (let property in obj) {
      if (!obj.hasOwnProperty(property)) {
        continue;
      }

      let value = obj[property];

      if (typeof value === 'object') {
        transObj[property] = ObjectToJoi._transform(value);
      } else {
        let validationSchema = JoiHelper[value];

        if (typeof validationSchema === 'undefined') {
          throw new InvalidSchemaException(obj, `Unknown field type ${value}`);
        }

        transObj[property] = validationSchema;
      }
    }

    return transObj;
  }
}
