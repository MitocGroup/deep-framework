/**
 * Created by AlexanderC on 5/27/15.
 */

'use strict';

import {Extractable} from './Extractable';
import {Region} from '../Region';
import {Service} from '../Service';
import {InvalidArgumentException} from '../../Exception/InvalidArgumentException';
import {InvalidArnException} from './Exception/InvalidArnException';

/**
 * IAM statement resource
 */
export class Resource extends Extractable {
  constructor(service = Service.ANY, region = '', accountId = '', descriptor = '') {
    super();

    this._service = null;
    this._region = null;
    this._accountId = accountId;
    this._descriptor = descriptor;

    this.service = service;
    this.region = region;

    this._any = false;
  }

  /**
   * @returns {Resource}
   */
  any() {
    this._any = true;
    return this;
  }

  /**
   * @param {String} identifier
   */
  set accountId(identifier) {
    this._accountId = identifier;
  }

  /**
   * @returns {String}
   */
  get accountId() {
    return this._accountId;
  }

  /**
   * @param {String} descriptor
   */
  set descriptor(descriptor) {
    this._descriptor = descriptor;
  }

  /**
   * @returns {String}
   */
  get descriptor() {
    return this._descriptor;
  }

  /**
   * @param {String} name
   */
  set region(name) {
    if (!Region.exists(name)) {
      throw new InvalidArgumentException(name, Region);
    }

    this._region = name;
  }

  /**
   * @returns {String}
   */
  get region() {
    return this._region;
  }

  /**
   * @param {String} name
   */
  set service(name) {
    if (!Service.exists(name)) {
      throw new InvalidArgumentException(name, Service);
    }

    this._service = name;
  }

  /**
   * @returns {String}
   */
  get service() {
    return this._service;
  }

  /**
   * @see - http://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html
   *
   * @param {string} arn
   * @returns {Resource}
   */
  updateFromArn(arn) {
    let arnParts = arn.split(':');

    if (arnParts.length < 6) {
      throw new InvalidArnException(arn);
    }

    this.service = arnParts[2];
    this.region = arnParts[3];
    this.accountId = arnParts[4];
    this.descriptor = arnParts.slice(5).join(':');

    return this;
  }

  /**
   * @returns {String}
   */
  extract() {
    if (this._any) {
      return '*';
    }

    let service = this._service;
    let region = this._region;
    let accountId = this._accountId;
    let descriptor = this._descriptor;

    return `arn:aws:${service}:${region}:${accountId}:${descriptor}`;
  }
}
