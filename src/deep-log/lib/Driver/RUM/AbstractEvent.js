/**
 * Created by mgoria on 1/29/16.
 */

'use strict';

import Core from 'deep-core';
import Joi from 'joi';
import {UnknownRumEventException} from '../Exception/UnknownRumEventException';
import {FrameworkEvent} from './FrameworkEvent';

/**
 * Abstract RUM event
 */
export class AbstractEvent extends Core.OOP.Interface {
  /**
   * @param {Object} kernel
   * @param {Object} rawData
   */
  constructor(kernel, rawData) {
    super(['toJSON', 'getValidationSchema', 'getEventLevel']);

    this._kernel = kernel;
    this._rawData = rawData;
    this._data = this._enrichWithContextData(rawData);

    this._validationError = null;
  }

  /**
   * @returns {String}
   */
  static get FRAMEWORK_EVENT_LEVEL() {
    return 'Framework';
  }

  /**
   * @returns {String}
   */
  static get BACKEND_CONTEXT() {
    return 'Backend';
  }

  /**
   * @returns {String}
   */
  static get FRONTEND_CONTEXT() {
    return 'Frontend';
  }

  /**
   * @returns {String[]}
   */
  static get CONTEXTS() {
    return [
      AbstractEvent.BACKEND_CONTEXT,
      AbstractEvent.FRONTEND_CONTEXT,
    ];
  }

  /**
   * @returns {String[]}
   */
  static get SERVICES() {
    return [
      'deep-asset',
      'deep-cache',
      'deep-core',
      'deep-db',
      'deep-event',
      'deep-fs',
      'deep-kernel',
      'deep-log',
      'deep-notification',
      'deep-resource',
      'deep-security',
      'deep-validation',
    ];
  }

  /**
   * @returns {String[]}
   */
  static get RESOURCE_TYPES() {
    return [
      'Browser',
      'Lambda',
      'S3',
      'DynamoDB',
    ];
  }

  /**
   * @param {Object} kernel
   * @param {Object} rawData
   * @returns {AbstractEvent}
   */
  static create(kernel, rawData) {
    let event = null;

    // @note - For the time being event type is guessed by event.service
    // (it'll be changed once we'll have other types of events)
    if (rawData.service && AbstractEvent.SERVICES.indexOf(rawData.service) !== -1) {
      event = new FrameworkEvent(kernel, rawData);
    } else {
      throw new UnknownRumEventException(rawData);
    }

    return event;
  }

  /**
   * @returns {Boolean}
   */
  isValid() {
    let result = this.validate();

    return result.error ? false : true;
  }

  /**
   * @returns {Object}
   */
  validate() {
    let result = Joi.validate(this._rawData, this.getValidationSchema(), {
      stripUnknown: true,
      convert: true,
      abortEarly: false,
    });

    if (result.error) {
      this._validationError = result.error;
    } else {
      this._data = result.value;
    }

    return result;
  }

  /**
   * @returns {Object|null}
   */
  get validationError() {
    return this._validationError;
  }

  /**
   * @param {Object} event
   * @returns {Object}
   * @private
   */
  _enrichWithContextData(event) {
    event.eventLevel = this.getEventLevel();
    event.time = event.time || new Date().getTime();
    event.metadata = event.metadata || {};

    if (this._kernel.isBackend) {
      let runtimeContext = this._kernel.runtimeContext;

      event.context = AbstractEvent.BACKEND_CONTEXT;
      event.memoryUsage = process.memoryUsage();
      event.environment = {}; // @todo - find a way to get Lambda container info (id, OS, etc)

      event.requestId = runtimeContext.awsRequestId;
      event.identityId = runtimeContext.identity && runtimeContext.identity.cognitoIdentityId ?
        runtimeContext.identity.cognitoIdentityId : '';
    } else {
      event.context = AbstractEvent.FRONTEND_CONTEXT;
      event.memoryUsage = window.performance && window.performance.memory ? window.performance.memory : {};
      event.environment = {
        userAgent: navigator ? navigator.userAgent : "",
      };

      let securityToken = this._kernel.get('security').token;
      event.identityId = securityToken && securityToken.identityId ? securityToken.identityId : '';
    }

    return event;
  }
}