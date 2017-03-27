/**
 * Created by vcernomschi on 6/20/16.
 */

'use strict';
import combine from 'istanbul-combine';
import fs from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';
import S3CoverageSynchronizer from './S3CoverageSynchronizer';
import GitHubMsgPublisher from './GitHubMsgPublisher';

export default class CoverageComparator {

  /**
   * @param {String} pathToAccess
   * @returns {boolean}
   */
  static accessSync(pathToAccess) {
    try {
      fs.accessSync(pathToAccess, fs.F_OK | fs.R_OK | fs.W_OK);
      return true;
    } catch (exception) {
      return false;
    }
  }

  /**
   * @param srcpath
   * @returns {String[]|*}
   */
  static getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function (file) {
      return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get LOCAL_COVERAGE_FULL_PATH() {
    return path.join(CoverageComparator.LOCAL_COVERAGE_SUMMARY_DIR, 'coverage-summary.json');
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get S3_COVERAGE_FULL_PATH() {
    return path.join(CoverageComparator.S3_COVERAGE_SUMMARY_DIR, 'coverage-summary.json');
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get REPORT_PREFIX() {
    return `${process.env['TRAVIS_REPO_SLUG']}/${process.env['TRAVIS_BRANCH']}/`;
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get LOCAL_COVERAGE_DIR() {
    return path.join(__dirname, `../../coverages/local/${CoverageComparator.REPORT_PREFIX}`);
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get S3_COVERAGE_DIR() {
    return path.join(__dirname, `../../coverages/aws/${CoverageComparator.REPORT_PREFIX}`);
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get LOCAL_COVERAGE_PATTERN() {
    return `${CoverageComparator.LOCAL_COVERAGE_DIR}**/coverage.json`;
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get S3_COVERAGE_PATTERN() {
    return `${CoverageComparator.S3_COVERAGE_DIR}**/coverage.json`;
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get LOCAL_COVERAGE_SUMMARY_DIR() {
    return `${CoverageComparator.LOCAL_COVERAGE_DIR}summary-report`;
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get S3_COVERAGE_SUMMARY_DIR() {
    return `${CoverageComparator.S3_COVERAGE_DIR}summary-report`;
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get LOCAL_COVERAGES_PATH() {
    return path.join(__dirname, '../../coverages/local');
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get S3_COVERAGES_PATH() {
    return path.join(__dirname, '../../coverages/aws');
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get GIT_REPO_NAME() {
    return process.env['TRAVIS_REPO_SLUG'].replace(/.*\/(.*)/i, '$1');
  }

  /**
   * @param {String} coverageDir - output directory for combined report(s)
   * @param {String} pattern - pattern to find json reports to be combined
   * @returns {Object}
   */
  static getOptions(coverageDir, pattern) {

    return {
      dir: coverageDir,
      pattern: pattern,
      reporters: {
        lcovonly: {},
        'json-summary': {},
      },
      base: '../../../',
    };
  }

  /**
   * Synchronous method to combine coverage reports
   * @param {String} coverageDir - output directory for combined report(s)
   * @param {String} pattern - pattern to find json reports to be combined
   * @returns {Number}
   */
  static combineSync(coverageDir, pattern) {

    combine.sync(CoverageComparator.getOptions(coverageDir, pattern));

    let result = (CoverageComparator.accessSync(CoverageComparator.LOCAL_COVERAGE_FULL_PATH)) ?
      JSON.parse(fs.readFileSync(CoverageComparator.LOCAL_COVERAGE_FULL_PATH, 'utf8')).total.lines.pct :
      0;

    return result;
  }

  /**
   *
   */
  static gatherReports() {
    let modulePaths = CoverageComparator.getDirectories(
      path.join(__dirname, '../../../src')
    );

    for (let modulePath of modulePaths) {
      let coveragePath = path.join(__dirname, '../../../src', modulePath, 'coverage/coverage.raw.json');

      if (CoverageComparator.accessSync(coveragePath)) {
        let coverageDestPath = path.join(
          CoverageComparator.LOCAL_COVERAGES_PATH,
          process.env['TRAVIS_REPO_SLUG'],
          process.env['TRAVIS_BRANCH'],
          'src',
          modulePath,
          'coverage/coverage.json'
        );

        fsExtra.ensureFileSync(coverageDestPath);
        fsExtra.copySync(coveragePath, coverageDestPath, {
          clobber: true,
        });
      }
    }
  }
}
