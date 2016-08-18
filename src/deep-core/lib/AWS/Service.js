/**
 * Created by AlexanderC on 5/27/15.
 */

'use strict';

/**
 * Available AWS services
 */
export class Service {
  /**
   * @returns {String}
   */
  static get ANY() {
    return '*';
  }

  /**
   * @returns {String}
   */
  static get EC2() {
    return 'ec2';
  }

  /**
   * @returns {String}
   */
  static get LAMBDA() {
    return 'lambda';
  }

  /**
   * @returns {String}
   */
  static get SIMPLE_EMAIL_SERVICE() {
    return 'ses';
  }

  /**
   * @returns {String}
   */
  static get SIMPLE_STORAGE_SERVICE() {
    return 's3';
  }

  /**
   * @returns {String}
   */
  static get DYNAMO_DB() {
    return 'dynamodb';
  }

  /**
   * @returns {String}
   */
  static get SIMPLE_NOTIFICATION_SERVICE() {
    return 'sns';
  }

  /**
   * @returns {String}
   */
  static get COGNITO_IDENTITY() {
    return 'cognito-identity';
  }

  /**
   * @returns {String}
   */
  static get COGNITO_IDENTITY_PROVIDER() {
    return 'cognito-idp';
  }

  /**
   * @returns {String}
   */
  static get COGNITO_SYNC() {
    return 'cognito-sync';
  }

  /**
   * @returns {String}
   */
  static get ELASTIC_CACHE() {
    return 'elasticache';
  }

  /**
   * @returns {String}
   */
  static get IDENTITY_AND_ACCESS_MANAGEMENT() {
    return 'iam';
  }

  /**
   * @returns {String}
   */
  static get KINESIS() {
    return 'kinesis';
  }

  /**
   * @returns {String}
   */
  static get CLOUD_FRONT() {
    return 'cloudfront';
  }

  /**
   * @returns {String}
   */
  static get CLOUD_SEARCH() {
    return 'cloudsearch';
  }

  /**
   * @returns {String}
   */
  static get SECURITY_TOKEN_SERVICE() {
    return 'sts';
  }

  /**
   * @returns {String}
   */
  static get CLOUD_WATCH() {
    return 'cloudwatch';
  }

  /**
   * @returns {String}
   */
  static get CLOUD_WATCH_LOGS() {
    return 'logs';
  }

  /**
   * @returns {String}
   */
  static get CLOUD_WATCH_EVENTS() {
    return 'events';
  }

  /**
   * @returns {String}
   */
  static get API_GATEWAY() {
    return 'apigateway';
  }

  /**
   * @returns {String}
   */
  static get API_GATEWAY_EXECUTE() {
    return 'execute-api';
  }

  /**
   * @returns {String}
   */
  static get SIMPLE_QUEUE_SERVICE() {
    return 'sqs';
  }

  /**
   * @returns {String}
   */
  static get CERTIFICATE_MANAGER() {
    return 'acm';
  }

  /**
   * @returns {String}
   */
  static get ELASTIC_SEARCH() {
    return 'es';
  }

  /**
   * @param {String} service
   * @returns {String}
   */
  static identifier(service) {
    return `${service}.amazonaws.com`;
  }

  /**
   * @param {String} name
   * @returns {Boolean}
   */
  static exists(name) {
    return -1 !== Service.list().indexOf(name);
  }

  /**
   * @returns {String[]}
   */
  static list() {
    return [
      Service.ANY,
      Service.LAMBDA,
      Service.SIMPLE_STORAGE_SERVICE,
      Service.DYNAMO_DB,
      Service.SIMPLE_NOTIFICATION_SERVICE,
      Service.COGNITO_IDENTITY,
      Service.COGNITO_IDENTITY_PROVIDER,
      Service.COGNITO_SYNC,
      Service.ELASTIC_CACHE,
      Service.IDENTITY_AND_ACCESS_MANAGEMENT,
      Service.KINESIS,
      Service.CLOUD_FRONT,
      Service.SECURITY_TOKEN_SERVICE,
      Service.CLOUD_WATCH_LOGS,
      Service.API_GATEWAY,
      Service.API_GATEWAY_EXECUTE,
      Service.CLOUD_SEARCH,
      Service.SIMPLE_QUEUE_SERVICE,
      Service.CERTIFICATE_MANAGER,
      Service.EC2,
      Service.ELASTIC_SEARCH,
      Service.CLOUD_WATCH_EVENTS,
      Service.CLOUD_WATCH,
      Service.SIMPLE_EMAIL_SERVICE,
    ];
  }
}
