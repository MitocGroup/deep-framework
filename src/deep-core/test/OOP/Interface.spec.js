/**
 * Created by AlexanderC on 6/22/15.
 */

'use strict';

import chai from 'chai';
import {Interface} from '../../lib/OOP/Interface';
import {MethodsNotImplementedException} from '../../lib/Exception/MethodsNotImplementedException';

class FailTest extends Interface {
  constructor() {
    super(['method_tbd']);
  }
}

class NestedInterface extends FailTest {
  constructor() {
    super();
  }

  method_tbd() {
    return 'yay!';
  }
}

suite('OOP/Interface', () => {

  test('Missing "method_tbd" method', () => {
    var error = null;

    try {
      new FailTest();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.an.instanceOf(MethodsNotImplementedException);
  });

  test('Implement "method_tbd" in a nested object', () => {
    let obj = new NestedInterface();

    chai.expect(obj.method_tbd()).to.equal('yay!');
  });
});