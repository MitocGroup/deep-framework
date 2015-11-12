
'use strict';

import chai from 'chai';
import {Service} from '../../lib.compiled/AWS/Service';

suite('AWS/Service', function() {
  let service = new Service();
  let serviceName = 'lambda';

  test('Class Service exists in AWS/Service', function() {
    chai.expect(typeof Service).to.equal('function');
  });

  test('Object of class Service created successfully', function() {
    chai.expect(typeof service).to.equal('object');
  });

  test('Check LAMBDA static getter returns "lambda"', function() {
    chai.expect(Service.LAMBDA).to.be.equal('lambda');
  });

  test('Check SIMPLE_STORAGE_SERVICE static getter returns "s3"', function() {
    chai.expect(Service.SIMPLE_STORAGE_SERVICE).to.be.equal('s3');
  });

  test('Check DYNAMO_DB static getter returns "dynamodb"', function() {
    chai.expect(Service.DYNAMO_DB).to.be.equal('dynamodb');
  });

  test('Check SIMPLE_NOTIFICATION_SERVICE static getter returns "sns"', function() {
    chai.expect(Service.SIMPLE_NOTIFICATION_SERVICE).to.be.equal('sns');
  });

  test('Check COGNITO_IDENTITY static getter returns "cognito-identity"', function() {
    chai.expect(Service.COGNITO_IDENTITY).to.be.equal('cognito-identity');
  });

  test('Check COGNITO_SYNC static getter returns "cognito-sync"', function() {
    chai.expect(Service.COGNITO_SYNC).to.be.equal('cognito-sync');
  });

  test('Check ELASTIC_CACHE static getter returns "elasticache"', function() {
    chai.expect(Service.ELASTIC_CACHE).to.be.equal('elasticache');
  });

  test('Check IDENTITY_AND_ACCESS_MANAGEMENT static getter returns "iam"', function() {
    chai.expect(Service.IDENTITY_AND_ACCESS_MANAGEMENT).to.be.equal('iam');
  });

  test('Check KINESIS static getter returns "kinesis"', function() {
    chai.expect(Service.KINESIS).to.be.equal('kinesis');
  });

  test('Check CLOUD_FRONT static getter returns "cloudfront"', function() {
    chai.expect(Service.CLOUD_FRONT).to.be.equal('cloudfront');
  });

  test('Check SECURITY_TOKEN_SERVICE static getter returns "sts"', function() {
    chai.expect(Service.SECURITY_TOKEN_SERVICE).to.be.equal('sts');
  });

  test('Check CLOUD_WATCH_LOGS static getter returns "logs"', function() {
    chai.expect(Service.CLOUD_WATCH_LOGS).to.be.equal('logs');
  });

  test('Check API_GATEWAY static getter returns "apigateway"', function() {
    chai.expect(Service.API_GATEWAY).to.be.equal('apigateway');
  });

  test(
    'Check API_GATEWAY_EXECUTE static getter returns "execute-api"',
    function() {
      chai.expect(Service.API_GATEWAY_EXECUTE).to.be.equal('execute-api');
    }
  );

  test(`Check identifier() static method returns ${serviceName}.amazonaws.com`, function() {
    chai.expect(Service.identifier(serviceName)).to.be.equal(`${serviceName}.amazonaws.com`);
  });

  test('Check all() static method returns array of Service alias', function() {
    chai.expect(Service.list().length).to.be.equal(15);
    chai.expect(Service.list()).to.be.include(Service.ANY);
    chai.expect(Service.list()).to.be.include(Service.LAMBDA);
    chai.expect(Service.list()).to.be.include(Service.SIMPLE_STORAGE_SERVICE);
    chai.expect(Service.list()).to.be.include(Service.DYNAMO_DB);
    chai.expect(Service.list()).to.be.include(Service.SIMPLE_NOTIFICATION_SERVICE);
    chai.expect(Service.list()).to.be.include(Service.COGNITO_IDENTITY);
    chai.expect(Service.list()).to.be.include(Service.COGNITO_SYNC);
    chai.expect(Service.list()).to.be.include(Service.ELASTIC_CACHE);
    chai.expect(Service.list()).to.be.include(Service.IDENTITY_AND_ACCESS_MANAGEMENT);
    chai.expect(Service.list()).to.be.include(Service.KINESIS);
    chai.expect(Service.list()).to.be.include(Service.CLOUD_FRONT);
    chai.expect(Service.list()).to.be.include(Service.SECURITY_TOKEN_SERVICE);
    chai.expect(Service.list()).to.be.include(Service.CLOUD_WATCH_LOGS);
    chai.expect(Service.list()).to.be.include(Service.API_GATEWAY);
    chai.expect(Service.list()).to.be.include(Service.API_GATEWAY_EXECUTE);
  });

  test('Check exists() static method returns true if Service exists', function() {
    chai.expect(Service.exists('lambda')).to.be.equal(true);
    chai.expect(Service.exists('dynamodb')).to.be.equal(true);
    chai.expect(Service.exists('sns')).to.be.equal(true);
  });

  test('Check exists() static method returns false if service doesn\'t exist', function() {
    chai.expect(Service.exists('')).to.be.equal(false);
    chai.expect(Service.exists()).to.be.equal(false);
    chai.expect(Service.exists('lambdas')).to.be.equal(false);
    chai.expect(Service.exists('test')).to.be.equal(false);
  });
});
