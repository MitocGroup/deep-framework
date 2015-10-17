'use strict';

export default class CacheMock {
  constructor() {
    this._container = null;
    this._driver = null;
    this._localBackend = false;
    this._microservice = null;
  }
}