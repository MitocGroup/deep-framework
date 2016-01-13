/**
 * Created by AlexanderC on 1/13/16.
 */

'use strict';

export class IndexNameNormalizer {
  /**
   * @param {Object} indexes
   */
  constructor(indexes) {
    this._indexes = indexes;
  }

  /**
   * @param {Object} data
   */
  normalizeSearchResponseData(data) {
    if (data.hits && data.hits.hit) {
      data.hits.hit = data.hits.hit.map((hit) => {

        // replace hits fields keys
        if (hit.hasOwnProperty('fields') && typeof hit.fields === 'object') {
          let fields = {};

          for (let fieldName in hit.fields) {
            if (!hit.fields.hasOwnProperty(fieldName)) {
              continue;
            }

            let fieldValue = hit.fields[fieldName];
            let normalizedFieldName = this._normalizeFieldName(fieldName);

            fields[normalizedFieldName] = fieldValue;
          }

          hit.fields = fields;
        }

        // replace hits highlights keys
        if (hit.hasOwnProperty('highlights') && typeof hit.highlights === 'object') {
          let fields = {};

          for (let fieldName in hit.highlights) {
            if (!hit.highlights.hasOwnProperty(fieldName)) {
              continue;
            }

            let fieldValue = hit.highlights[fieldName];
            let normalizedFieldName = this._normalizeFieldName(fieldName);

            fields[normalizedFieldName] = fieldValue;
          }

          hit.highlights = fields;
        }

        return hit;
      });
    }
  }

  /**
   * @param {String} rawField
   * @returns {String}
   * @private
   */
  _normalizeFieldName(rawField) {
    for (let field in this._indexes) {
      if (!this._indexes.hasOwnProperty(field)) {
        continue;
      }

      let realField = this._indexes[field];

      if (rawField === realField) {
        return field;
      }
    }

    return rawField;
  }

  /**
   * @returns {Object}
   */
  get indexes() {
    return this._indexes;
  }
}