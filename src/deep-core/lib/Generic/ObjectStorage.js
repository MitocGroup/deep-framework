/**
 * Created by AlexanderC on 5/27/15.
 */

'use strict';

/**
 * Simple object storage implementation
 */
export class ObjectStorage {
  /**
   * @param {Array} objects
   */
  constructor(...objects) {
    if (objects.length === 1 && objects[0] instanceof Array) {
      objects = objects[0];
    }

    this._vector = objects;
  }

  /**
   * @param {*} object
   * @returns {ObjectStorage}
   */
  add(object) {
    this._vector.push(object);

    return this;
  }

  /**
   * @param {*} thing
   * @param {Boolean} strict
   * @returns {*}
   */
  find(thing, strict = false) {
    for (let objectKey in this._vector) {
      if (!this._vector.hasOwnProperty(objectKey)) {
        continue;
      }

      let object = this._vector[objectKey];

      if ((strict && object === thing) || (!strict && object instanceof thing)) {
        return object;
      }
    }
  }

  /**
   * @returns {Array}
   */
  get iterator() {
    return this._vector;
  }
}
