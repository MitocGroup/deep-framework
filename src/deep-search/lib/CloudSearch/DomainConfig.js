/**
 * Created by AlexanderC on 1/13/16.
 */

'use strict';

export class DomainConfig {
  /**
   * @param {String} name
   * @param {String} sourceTable
   * @param {String} docEndpoint
   * @param {String} searchEndpoint
   * @param {Object} indexes
   * @param {Object} suggesters
   */
  constructor(name, sourceTable, docEndpoint, searchEndpoint, indexes, suggesters){
    this._name = name;
    this._sourceTable = sourceTable;
    this._docEndpoint = docEndpoint;
    this._searchEndpoint = searchEndpoint;
    this._indexes = indexes;
    this._suggesters = suggesters;
  }

  /**
   * @returns {String}
   */
  get name() {
    return this._name;
  }

  /**
   * @returns {String}
   */
  get sourceTable() {
    return this._sourceTable;
  }

  /**
   * @returns {String}
   */
  get docEndpoint() {
    return this._docEndpoint;
  }

  /**
   * @returns {String}
   */
  get searchEndpoint() {
    return this._searchEndpoint;
  }

  /**
   * @returns {Object}
   */
  get indexes() {
    return this._indexes;
  }

  /**
   * @returns {Object}
   */
  get suggesters() {
    return this._suggesters;
  }

  /**
   * @param {Object} config
   */
  static createFromSearchConfig(config) {
    return new DomainConfig(
      config.name,
      config.table,
      config.endpoints.push,
      config.endpoints.search,
      config.indexes,
      config.suggesters
    );
  }
}
