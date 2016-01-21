/**
 * Created by AlexanderC on 6/22/15.
 */

'use strict';

import chai from 'chai';
import {Sandbox} from '../../lib/Runtime/Sandbox';
import {MethodsNotImplementedException} from '../../lib/Exception/MethodsNotImplementedException';

suite('OOP/Sandbox', () => {
  test('Test throw exception', (done) => {
    let sandbox = new Sandbox(() => {
      throw new Error('TEST');
    });

    sandbox
      .fail((error) => {
        chai.expect(error).to.be.an.instanceof(Error);

        done();
      })
      .run();
  });
});
