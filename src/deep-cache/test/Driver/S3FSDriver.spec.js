'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {S3FSDriver} from '../../lib.compiled/Driver/S3FSDriver';
import {ContainerAware} from '../../node_modules/deep-kernel/lib.compiled/ContainerAware';

chai.use(sinonChai);

suite('Driver/S3FSDriver', () => {
  let containerAware = new ContainerAware();
  let s3FsDriver = new S3FSDriver(containerAware);

  test('Class S3FSDriver exists in Driver/S3FSDriver', () => {
    chai.expect(S3FSDriver).to.be.an('function');
  });

  test('Check constructor', () => {
    chai.expect(s3FsDriver, 'is an instance of S3FSDriver').to.be.an.instanceOf(S3FSDriver);

    chai.expect(
      s3FsDriver._containerAware, 'is an instance of ContainerAware'
    ).to.be.an.instanceOf(ContainerAware);
  });
});
