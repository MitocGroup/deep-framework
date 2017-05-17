#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const libsDir = path.join(__dirname, '../src');

fs.readdirSync(libsDir)
  .filter(dir => /^deep-[a-z]+$/i.test(dir))
  .map(dir => {
    const libPath = path.join(libsDir, dir);
    const testPath = path.join(libPath, 'test');
    const mainSpecPath = path.join(testPath, 'main.spec.js');
    const packageObj = require(path.join(libPath, 'package.json'));
    const lib = packageObj.name;
    
    !fs.existsSync(testPath) && fs.mkdirSync(testPath);
    
    const content = (lib === 'deep-framework') 
? 
`'use strict';

const chai = require('chai');
const lib = require('../lib.es6/Framework.js').Framework;

describe('Sample suit for ${ lib }', () => {  
  it('Check Framework.js to export an instanceof Function', () => {
    chai.expect(lib).to.be.instanceof(Function);
  });
});
`
:
`'use strict';

const chai = require('chai');
const lib = require('../lib.es6/bootstrap.js');

describe('Sample suit for ${ lib }', () => {  
  it('Check bootstrap.js to export an instanceof ${ (lib === 'deep-core') ? 'Object' : 'Function' }', () => {
    chai.expect(lib).to.be.instanceof(${ (lib === 'deep-core') ? 'Object' : 'Function' });
  });
});
`;
    console.log(`${ lib }:`);
    console.log(`  root: src/${ lib }`);
    
    // const deepDeps = Object.keys((packageObj.dependencies || {}))
    //   .filter(dep => /^deep-[a-z]+$/i.test(dep));
    // 
    // if (deepDeps.length > 0) {
    //   console.log(`  dependencies:`);
    //   
    //   deepDeps.map(key => {
    //     console.log(`     ${ key }: file:../${ key }`);
    //   });
    // } else {
    //   console.log(`  dependencies: ~`);
    // }
  
    fs.writeFileSync(mainSpecPath, content);
  });
