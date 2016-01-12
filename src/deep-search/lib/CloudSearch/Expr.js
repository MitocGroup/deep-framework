/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import {NativeParameter} from './NativeParameter';
import {Item} from './Expr/Item';

export class Expr extends NativeParameter {
  /**
   * @param {Item|*} items
   */
  constructor(...items) {
    super();

    this._items = items;
  }

  /**
   * @param {String} value
   * @returns {Expr}
   */
  value(value) {
    this._items = new Item(value);

    return this;
  }

  /**
   * @param {String} value
   * @param {String} name
   * @returns {Expr}
   */
  add(value, name = null) {
    if (this.isSimple) {
      this._items[0].name = 'expression1';
    }

    name = name || `expression${this._items.length}`;

    this._items.push(new Item(value, name));

    return this;
  }

  /**
   * @returns {Item[]}
   */
  get items() {
    return this._items;
  }

  /**
   * @returns {Boolean}
   */
  get isSimple() {
    return this._items.length === 1 && !this._items[0].isNamed;
  }

  /**
   * @returns {String}
   */
  export() {
    if (this.isSimple) {
      return this._items[0].value;
    }

    let expr = {};

    this._items.forEach((item) => {
      expr[item.name] = item.value;
    });

    return JSON.stringify(expr);
  }
}