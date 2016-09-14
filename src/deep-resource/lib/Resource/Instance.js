/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {MissingActionException} from './Exception/MissingActionException';
import {Action} from './Action';

/**
 * Resource instance
 */
export class Instance {
  /**
   * @param {String} name
   * @param {Object} microservice
   */
  constructor(name, microservice) {
    this._name = name;
    this._microservice = microservice;
    this._rawActions = microservice.rawResources[name];
    this._actions = null;
    this._localBackend = false;
    this._isBackend = false;
    this._cache = null;
    this._security = null;
    this._validation = null;
    this._contextProvider = null;
    this._log = null;

    this._fillActions();
  }

  /**
   * @returns {Object}
   */
  get actionsConfig() {
    let config = {};

    for (let actionName in this.actions) {
      if (!this.actions.hasOwnProperty(actionName)) {
        continue;
      }

      let action = this.actions[actionName];

      config[action.sourceId] = {
        resource: this._name,
        name: action.name,
        type: action.type,
        methods: action.methods,
        source: action.source,
        region: action.region,
        forceUserIdentity: action.forceUserIdentity,
        validationSchema: action.validationSchemaName,
      };
    }

    return config;
  }

  /**
   * @private
   */
  _fillActions() {
    this._actions = {};

    for (let actionName in this._rawActions) {
      if (!this._rawActions.hasOwnProperty(actionName)) {
        continue;
      }

      let actionMetadata = this._rawActions[actionName];

      let actionInstance = new Action(
        this,
        actionName,
        actionMetadata.type,
        actionMetadata.methods,
        actionMetadata.source,
        actionMetadata.region,
        actionMetadata.forceUserIdentity,
        actionMetadata.apiCache,
        actionMetadata.scope,
        actionMetadata.api
      );

      if (actionMetadata.validationSchema) {
        actionInstance.validationSchemaName = actionMetadata.validationSchema;
      }

      this._actions[actionName] = actionInstance;
    }
  }

  /**
   * @returns {Object}
   */
  get microservice() {
    return this._microservice;
  }

  /**
   * @returns {Object}
   */
  get validation() {
    return this._validation;
  }

  /**
   * @param {Object} validation
   */
  set validation(validation) {
    this._validation = validation;
  }

  /**
   * @returns {Object}
   */
  get security() {
    return this._security;
  }

  /**
   * @param {Object} security
   */
  set security(security) {
    this._security = security;
  }

  /**
   * @returns {String}
   */
  get name() {
    return this._name;
  }

  /**
   * @returns {Object}
   */
  get cache() {
    return this._cache;
  }

  /**
   * @param {Object} cache
   */
  set cache(cache) {
    this._cache = cache;
  }

  /**
   * @returns {Object}
   */
  get log() {
    return this._log;
  }

  /**
   * @param {Object} log
   */
  set log(log) {
    this._log = log;
  }

  /**
   * @returns {Boolean}
   */
  get localBackend() {
    return this._localBackend;
  }

  /**
   * @param {Boolean} state
   */
  set localBackend(state) {
    this._localBackend = state;
  }

  /**
   * @returns {Boolean}
   */
  get isBackend() {
    return this._isBackend;
  }

  /**
   * @param {Boolean} state
   */
  set isBackend(state) {
    this._isBackend = state;
  }

  /**
   * @returns {Object}
   */
  get actions() {
    return this._actions;
  }

  /**
   * @param {ContextProvider} contextProvider
   */
  set contextProvider(contextProvider) {
    this._contextProvider = contextProvider;
  }

  /**
   * @returns {ContextProvider}
   */
  get contextProvider() {
    return this._contextProvider;
  }

  /**
   * @param {String} actionName
   * @returns {boolean}
   */
  has(actionName) {
    return this.actions.hasOwnProperty(actionName);
  }

  /**
   * @param {String} actionName
   * @returns {Action}
   */
  action(actionName) {
    if (!this.has(actionName)) {
      throw new MissingActionException(this.name, actionName);
    }

    return this.actions[actionName];
  }

  /**
   * @param {String} actionName
   * @param {*} args
   * @returns {Action}
   */
  request(actionName, ...args) {
    return this.action(actionName).request(...args);
  }
}
