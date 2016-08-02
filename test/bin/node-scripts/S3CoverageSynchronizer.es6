/**
 * Created by vcernomschi on 6/20/16.
 */

'use strict';
import AWS from 'aws-sdk';
import s3 from 's3';
import path from 'path';

export default class S3CoverageSynchronizer {

  /**
   * @returns {String}
   * @constructor
   */
  static get GIT_REPO_NAME() {
    return process.env['TRAVIS_REPO_SLUG'];
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get GIT_BRANCH() {
    return process.env['TRAVIS_BRANCH'];
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get BUCKET_NAME() {
    return process.env.S3_BUCKET_NAME;
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get REPORT_PREFIX() {
    return `${S3CoverageSynchronizer.GIT_REPO_NAME}/${S3CoverageSynchronizer.GIT_BRANCH}/`;
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get LOCAL_REPORTS_PATH() {
    return path.join(__dirname, `../../coverages/local/${S3CoverageSynchronizer.REPORT_PREFIX}`);
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get S3_REPORTS_PATH() {
    return path.join(__dirname, `../../coverages/aws/${S3CoverageSynchronizer.REPORT_PREFIX}`);
  }

  constructor() {
    this._awsS3 = new AWS.S3({
      region: process.env.AWS_DEFAULT_REGION,
    });

    this._client = s3.createClient({
      s3Client: this._awsS3,
    });
  }

  /**
   * @returns {Object}
   */
  get client() {
    return this._client;
  }

  /**
   * @returns {Object}
   */
  get awsS3() {
    return this._awsS3;
  }

  /**
   * Create bucket if it doesn't exists
   * @param {Function} callback
   */
  init(callback) {

    let params = {
      Bucket: S3CoverageSynchronizer.BUCKET_NAME,
    };

    this.awsS3.headBucket(params, (err, metadata) => {

      if (err && err.code === 'NotFound') {

        this.awsS3.createBucket(params, (err, response) => {

          if (err) {
            console.log(err)
            callback(err, null);
          }

          callback(null, response);

        });
      }
      callback(null, metadata);
    });
  }

  /**
   * Download reports from s3 to destination directory on local file system
   * @param {String} fromBucket - s3 bucket name
   * @param {String} fromPrefix - s3 prefix
   * @param {String} destPath - destination directory on local file system to sync to
   * @param {Function} callback
   */
  downloadReportsFromS3(fromBucket, fromPrefix, destPath, callback) {

    let params = {
      localDir: destPath,
      deleteRemoved: true,
      s3Params: {
        Bucket: fromBucket,
        Prefix: fromPrefix,
      },
    };

    let downloader = this.client.downloadDir(params);
    downloader.on('error', function (err) {
      console.error('unable to download:', err);
      callback(err, null);
    });
    downloader.on('progress', () => {
    });
    downloader.on('end', () => {
      console.log('done downloading to');
      callback(null);
    });
  }

  /**
   * Syncs reports from directory on local file system to s3
   * @param {String} sourcePath - source directory on local file system to sync from
   * @param {String} destBucket - destination s3 bucket name
   * @param {String} destPrefix - destination prefix
   * @param {Function} callback
   */
  syncReportsToS3(sourcePath, destBucket, destPrefix, callback) {

    let params = {
      localDir: sourcePath,
      deleteRemoved: true,
      s3Params: {
        Bucket: destBucket,
        Prefix: destPrefix,
      },
    };

    let uploader = this.client.uploadDir(params);
    uploader.on('error', function (err) {
      console.error('unable to sync:', err);
      callback(err, null);
    });
    uploader.on('progress', () => {
    });
    uploader.on('end', () => {
      console.log('done sync');
      callback(null, null);
    });
  }

  /**
   * Removes reports from s3
   * @param {String} bucketName - s3 bucket name
   * @param {String} prefix - s3 prefix
   * @param {Function} callback
   */
  deleteReportsFromS3(bucketName, prefix, callback) {

    let params = {
      Bucket: bucketName,
      Prefix: prefix,
    };

    let remover = this.client.deleteDir(params);
    remover.on('error', function (err) {
      console.error('unable to sync:', err);
      callback(err, null);
    });
    remover.on('progress', () => {
    });
    remover.on('end', () => {
      console.log('done removing');
      callback(null, null);
    });
  }
}
