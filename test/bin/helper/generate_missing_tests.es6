/**
 * Created by AlexanderC on 9/3/15.
 */

'use strict';

import {FindClasses} from './FindClasses';
import os from 'os';
import path from 'path';

let modulePath = process.argv[2];

if (!modulePath) {
  console.error('Missing NPM module path');
  process.exit(1);
}

console.log('Start generating missing tests in', modulePath);

let classesFinder = new FindClasses(path.resolve(modulePath));

console.log(
  'Generated test files:',
  os.EOL,
  '- ' + classesFinder.generateMissingTests().join(`${os.EOL}- `),
  os.EOL
);
