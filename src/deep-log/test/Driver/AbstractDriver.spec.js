'use strict';

import chai from 'chai';
import {AbstractDriver} from '../../lib/Driver/AbstractDriver';
import {AbstractDriverMock} from '../Mock/AbstractDriverMock';

suite('Driver/AbstractDriver', () => {
  let abstractDriver = new AbstractDriverMock();

  test('Class AbstractDriver exists in Driver/AbstractDriver', () => {
    chai.expect(AbstractDriver).to.be.an('function');
  });

  test('Check that instance was created successfully for inherit classes',
    () => {
      chai.assert.typeOf(
        abstractDriver, 'object', 'created abstractDriver object'
      );
      chai.assert.instanceOf(
        abstractDriver, AbstractDriver, 'abstractDriver is instance of AbstractDriver'
      );
    }
  );

  test('Check datetime static getter returns Date object', () => {
    chai.assert.typeOf(
      AbstractDriver.datetime, 'string', 'datetime returns an ISOString'
    );
  });

  test('Check plainifyContext() returns valid plainContext for object',
    () => {
      let context = {
        firstKey: 'testValue1',
        secondKey: 'testValue2',
      };
      let actualResult = AbstractDriver.plainifyContext(context);
      
      chai.expect(actualResult).to.equal(JSON.stringify(context));
    }
  );

  test(
    'Check plainifyContext() returns valid plainContext for instance of Object',
    () => {
      let context = () => {
        return 'context';
      };
      let type = typeof context;
      let actualResult = AbstractDriver.plainifyContext(context);

      chai.expect(actualResult).to.equal(`${type}: ${context.toString()}`);
    }
  );

  test('Check plainifyContext() returns valid plainContext for string',
    () => {
      let context = 'context';
      let actualResult = AbstractDriver.plainifyContext(context);

      chai.expect(actualResult).to.equal(context);
    }
  );
});
