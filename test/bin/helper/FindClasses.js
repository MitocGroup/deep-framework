/**
 * Created by AlexanderC on 9/3/15.
 */

'use strict';

import path from 'path';
import fs from 'fs';
import os from 'os';

export class FindClasses {
  /**
   * @param {String} modulePath
   */
  constructor(modulePath) {
    this._modulePath = path.normalize(modulePath);

    this._libPath = path.join(this._modulePath, FindClasses.LIB_DIR);
    this._realLibPath = path.join(this._modulePath, FindClasses.REAL_LIB_DIR);
    this._testsPath = path.join(this._modulePath, FindClasses.TESTS_DIR);
  }

  /**
   * @returns {String[]}
   */
  generateMissingTests() {
    let generatedTests = [];
    let classFiles = FindClasses._lookupClassFiles(this._libPath);

    for (let filepath of classFiles) {
      let relativePath = filepath.substr(this._libPath.length + 1);
      let testFilePath = path.join(this._testsPath, relativePath);

      if (!fs.existsSync(testFilePath)) {
        let testContent = FindClasses._genTestSuite(relativePath);

        FindClasses._assureFileDir(testFilePath);
        fs.writeFileSync(testFilePath, testContent);

        generatedTests.push(testFilePath);
      }
    }

    return generatedTests;
  }

  /**
   * @param {String} filePath
   * @private
   */
  static _assureFileDir(filePath) {
    let dirname = path.dirname(filePath);
    let dirnameVector = dirname.split('/');
    let prevDir = '/';

    for (let i in dirnameVector) {
      if (!dirnameVector.hasOwnProperty(i)) {
        continue;
      }

      let dir = dirnameVector[i];
      let curDir = path.join(prevDir, dir);
      prevDir = curDir;

      if (!fs.existsSync(curDir)) {
        fs.mkdirSync(curDir);
      }
    }
  }

  /**
   * @param {String} relativePath
   * @returns {String}
   * @private
   */
  static _genTestSuite(relativePath) {
    return FindClasses.TEST_TPL
      .replace(/\{import\}/g, FindClasses._genClassInclude(relativePath))
      .replace(/\{fullClass\}/g, FindClasses._getFullClassName(relativePath))
      .replace(/\{class\}/g, FindClasses._getClassName(relativePath));
  }

  /**
   * @param {String} relativePath
   * @returns {String}
   * @private
   */
  static _genClassInclude(relativePath) {
    let dotsLength = relativePath.split('/').length;
    let relPathPrefix = "../".repeat(dotsLength) + FindClasses.REAL_LIB_DIR;

    return `import {${FindClasses._getClassName(relativePath)}} from '${relPathPrefix}/${FindClasses._getFullClassName(relativePath)}';`;
  }

  /**
   * @param {String} relativePath
   * @returns {String}
   * @private
   */
  static _getFullClassName(relativePath) {
    return relativePath.substr(0, relativePath.length - path.extname(relativePath).length);
  }

  /**
   * @param {String} relativePath
   * @returns {String}
   * @private
   */
  static _getClassName(relativePath) {
    return path.basename(relativePath, path.extname(relativePath));
  }

  /**
   * @param {String} dir
   * @param {Array} files_
   * @returns {Array}
   * @private
   */
  static _lookupClassFiles(dir, files_ = null) {
    files_ = files_ || [];

    let files = fs.readdirSync(dir);

    for (let i in files){
      if (!files.hasOwnProperty(i)) {
        continue;
      }

      let filename = files[i];
      let filepath = path.join(dir, filename);

      if (fs.statSync(filepath).isDirectory()){
        FindClasses._lookupClassFiles(filepath, files_);
      } else {
        if (!FindClasses._isClassFile(filename)) {
          continue;
        }

        files_.push(filepath);
      }
    }

    return files_;
  }

  /**
   * @param {String} filename
   * @returns {Boolean}
   * @private
   */
  static _isClassFile(filename) {
    return /^[A-Z]/.test(filename) && !/exception\.js$/i.test(filename) && path.extname(filename) === '.js';
  }

  /**
   * @returns {String}
   */
  get testsPath() {
    return this._testsPath;
  }

  /**
   * @returns {String}
   */
  get realLibPath() {
    return this._realLibPath;
  }

  /**
   * @returns {String}
   */
  get libPath() {
    return this._libPath;
  }

  /**
   * @returns {String}
   */
  get modulePath() {
    return this._modulePath;
  }

  /**
   * @returns {String}
   * @constructor
   */
  static get TEST_TPL() {
    let content = [];

    content.push(`// THIS TEST WAS GENERATED AUTOMATICALLY ON ${new Date().toString()}`);
    content.push("");
    content.push("'use strict';");
    content.push("");
    content.push("import chai from 'chai';");
    content.push("{import}");
    content.push("");
    content.push("// @todo: Add more advanced tests");
    content.push("suite(\"{fullClass}\", function() {");
    content.push("  test('Class {class} exists in {fullClass}', function() {");
    content.push("    chai.expect(typeof {class}).to.equal('function');");
    content.push("  });");
    content.push("});");
    content.push("");

    return content.join(os.EOL);
  }

  /**
   * @returns {String}
   */
  static get LIB_DIR() {
    return 'lib';
  }

  /**
   * @returns {String}
   */
  static get REAL_LIB_DIR() {
    return 'lib.compiled';
  }

  /**
   * @returns {String}
   */
  static get TESTS_DIR() {
    return 'test';
  }
}
