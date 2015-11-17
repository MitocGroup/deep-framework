/**
 * Created by AlexanderC on 9/23/15.
 */

'use strict';

import {PathAwareDriver} from './PathAwareDriver';
import LocalDynamoServer from 'local-dynamo';
import {FailedToStartServerException} from './Exception/FailedToStartServerException';
import fse from 'fs-extra';

export class LocalDynamo extends PathAwareDriver {
  /**
   * @param {Object} options
   * @param {String} path
   * @param {Number} port
   */
  constructor(options = LocalDynamo.DEFAULT_OPTIONS, path = LocalDynamo.DBPath, port = LocalDynamo.DEFAULT_PORT) {
    super(path, port);

    this._options = options;
    this._process = null;

    this._pickUpOldInstance = true; // @todo: set it false by default?
  }

  /**
   * @returns {Boolean}
   */
  get pickUpOldInstance() {
    return this._pickUpOldInstance;
  }

  /**
   * @param {Boolean} state
   */
  set pickUpOldInstance(state) {
    this._pickUpOldInstance = state;
  }

  /**
   * @returns {Object}
   */
  get options() {
    return this._options;
  }

  /**
   * @param {Function} cb
   * @private
   */
  _start(cb) {
    let cbTriggered = false;

    // avoid local-dynamo package issues...
    fse.ensureDirSync(this.path);

    this._options.dir = this.path;

    try {
      this._process = LocalDynamoServer.launch(this._options, this.port);
    } catch (error) {
      this._pickUpOldInstance
        ? cb(null)
        : cb(new FailedToStartServerException(this, error));

      return;
    }

    // This hook fixes DynamoDB startup delay by waiting an empty stdout dataset
    // @todo: remove this hook after fixing issue!
    this._process.stdout.on('data', (data) => {
      if (data.toString() && !cbTriggered) {
        cbTriggered = true;
        cb(null);
      }
    });

    let onError = (error) => {
      this._stop(() => {});

      if (!cbTriggered) {
        cbTriggered = true;
        cb(new FailedToStartServerException(this, error));
      }
    };

    this._process.on('uncaughtException', onError);
    this._process.on('error', onError);
    this._process.on('exit', () => {
      this.stop(() => '');
    });
  }

  /**
   * @param {Function} cb
   * @private
   */
  _stop(cb) {
    if (this._process) {
      this._process.kill();
      this._process = null;
    }

    cb(null);
  }

  /**
   * @returns {Object}
   */
  static get DEFAULT_OPTIONS() {
    return {
      stdio: 'pipe',
    };
  }
}
