/**
 * Created by AlexanderC on 01/25/17.
 */

'use strict';

import 'clientjs';

const singletonInstance = Symbol();
const singletonEnforcer = Symbol();

export class ClientSession extends window.ClientJS {
  
  /**
   * @param {Symbol} enforcer
   */
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer) {
      throw new Error('Cannot construct new ClientSession instance');
    }
    
    super();
    
    this._sessionId = this._buildSessionId();
  }
  
  /**
   * @param {String} defaultValue
   *
   * @returns {String}
   */
  getSitePlatform(defaultValue = 'custom') {
    const metaGenerator = this._findMetaContent('generator');
    
    if (metaGenerator.length <= 0) {
      return defaultValue;
    }
    
    for (let meta of metaGenerator) {
      for (let name in this._cmsMapping) {
        if (!this._cmsMapping.hasOwnProperty(name)) {
          continue;
        } else if (this._cmsMapping[name].test(meta)) {
          return name;
        }
      }
    }
    
    return defaultValue;
  }
  
  /**
   * @returns {*}
   *
   * @private
   */
  get _cmsMapping() {
    return {
      'contao': /Contao/i,
      'wordpress': /WordPress/i,
      'joomla': /Joomla/i,
      'drupal': /Drupal/i,
      'typo3': /TYPO3/i,
    };
  }
  
  /**
   * @param {String} name
   * @param {Boolean} lowercase
   *
   * @returns {String[]}
   * 
   * @private
   */
  _findMetaContent(name, lowercase = true) {
    if (!document || typeof document.getElementsByTagName !== 'function') {
      return [];
    }
    
    name = (name || '').toLowerCase();
    
    return this._htmlCollectionToArray(
      document.getElementsByTagName('meta')
    ).filter(meta => {
      return (meta.getAttribute('name') || '').toLowerCase() === name
        || (meta.getAttribute('property') || '').toLowerCase() === name;
    }).map(meta => {
      const content = meta.getAttribute('content') || '';
      
      return lowercase ? content.toLowerCase() : content;
    });
  }
  
  /**
   * @param {HTMLCollection|*} collection
   *
   * @returns {Array}
   * 
   * @private
   */
  _htmlCollectionToArray(collection) {
    let result = [];
    
    for (let i = 0; i < collection.length; i++) {
      result.push(collection[i]);
    } 
    
    return result;
  }
  
  /**
   * @returns {String}
   */
  getSessionId() {
    return this._sessionId;
  }
  
  /**
   * @returns {ClientSession|*} singletonInstance
   */
  static get instance() {
    if (!this[singletonInstance]) {
      this[singletonInstance] = new ClientSession(singletonEnforcer);
    }

    return this[singletonInstance];
  }
  
  /**
   * @returns {String}
   *
   * @private
   */
  _buildSessionId() {
    const fp = this.getFingerprint();
    
    return `${fp}${Date.now()}`
      .match(/.{1,6}/g).join('-');
  }
}
