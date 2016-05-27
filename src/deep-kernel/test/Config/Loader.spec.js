/**
 * Created by vcernomschi on 5/27/16.
 */


'use strict';

import chai from 'chai';
import {Loader} from '../../lib/Config/Loader';

suite('Config/Loader', function() {
  test('Class Loader exists in Config/Loader', () => {
    chai.expect(Loader).to.be.an('function');
  });
});
