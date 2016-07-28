'use strict';

export class ObjectVector {

  /**
   * @param {Function} proto
   * @param {Object[]|*} instances
   */
  constructor(proto, ...instances) {
    this._proto = proto;
    this._vector = [];

    this.add(...instances);
  }

  /**
   * Add new instances to collection
   * @param {Object[]|*} instances
   * @returns {ObjectVector}
   */
  add(...instances) {
    for (let i in instances) {
      if (!instances.hasOwnProperty(i)) {
        continue;
      }

      let instance = instances[i];

      if (!(instance instanceof this._proto)) {
        throw new Error(
          `The object ${instance.constructor.name} is not an instance of ${this._proto.name}`
        );
      }

      this._vector.push(instance);
    }

    return this;
  }

  /**
   * Get collection of instances
   * @returns {Object[]}
   */
  get collection() {
    return this._vector;
  }
}
