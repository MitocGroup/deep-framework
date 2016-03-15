// THIS TEST WAS GENERATED AUTOMATICALLY ON Thu Mar 10 2016 14:46:23 GMT+0200 (EET)

'use strict';

import chai from 'chai';
import {Loader} from '../../lib/Config/Loader';

// @todo: Add more advanced tests
suite('Config/Loader', function() {
  test('Class Loader exists in Config/Loader', () => {
    chai.expect(Loader).to.be.an('function');
  });
});
