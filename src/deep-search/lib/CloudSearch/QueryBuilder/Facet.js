/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import {NativeParameter} from './NativeParameter';
import {Item} from './Facet/Item';

export class Facet extends NativeParameter {
  /**
   * @param {Item|*} facets
   */
  constructor(...facets) {
    super();

    this._items = facets;
  }

  /**
   * @param {String} field
   * @param {Function} closure
   * @returns {Facet}
   *
   * @example facet.add('year', (facet) => {
   *  facet.sortByCount().top(3);
   * })
   */
  add(field, closure) {
    let item = new Item(field);

    this._items.push(item);

    closure(item);

    return this;
  }

  /**
   * @returns {Item[]}
   */
  items() {
    return this._items;
  }

  /**
   * @returns {String}
   */
  export() {
    let facets = {};

    this._items.forEach((facet) => {
      facets[facet.field] = facet.options;
    });

    return JSON.stringify(facets);
  }
}
