'use strict';

import chai from 'chai';
import {Region} from '../../lib.compiled/AWS/Region';

suite('AWS/Region', function() {
  let region = new Region();

  test('Class Region exists in AWS/Region', function() {
    chai.expect(typeof Region).to.equal('function');
  });

  test('Check ANY static getter returns \'*\'', function() {
    chai.expect(Region.ANY).to.be.equal('*');
  });

  test('Check ASIA_PACIFIC_TOKYO static getter returns \'ap-northeast-1\'', function() {
    chai.expect(Region.ASIA_PACIFIC_TOKYO).to.be.equal('ap-northeast-1');
  });

  test('Check ASIA_PACIFIC_SINGAPORE static getter returns \'ap-southeast-1\'', function() {
    chai.expect(Region.ASIA_PACIFIC_SINGAPORE).to.be.equal('ap-southeast-1');
  });

  test('Check ASIA_PACIFIC_SYDNEY static getter returns \'ap-southeast-2\'', function() {
    chai.expect(Region.ASIA_PACIFIC_SYDNEY).to.be.equal('ap-southeast-2');
  });

  test('Check EU_FRANKFURT static getter returns \'eu-central-1\'', function() {
    chai.expect(Region.EU_FRANKFURT).to.be.equal('eu-central-1');
  });

  test('Check EU_IRELAND static getter returns \'eu-west-1\'', function() {
    chai.expect(Region.EU_IRELAND).to.be.equal('eu-west-1');
  });

  test('Check SOUTH_AMERICA_SAO_PAULO static getter returns \'sa-east-1\'', function() {
    chai.expect(Region.SOUTH_AMERICA_SAO_PAULO).to.be.equal('sa-east-1');
  });

  test('Check US_EAST_N_VIRGINIA static getter returns \'us-east-1\'', function() {
    chai.expect(Region.US_EAST_N_VIRGINIA).to.be.equal('us-east-1');
  });

  test('Check US_WEST_N_CALIFORNIA static getter returns \'us-west-1\'', function() {
    chai.expect(Region.US_WEST_N_CALIFORNIA).to.be.equal('us-west-1');
  });

  test('Check US_WEST_OREGON static getter returns \'us-west-2\'', function() {
    chai.expect(Region.US_WEST_OREGON).to.be.equal('us-west-2');
  });

  test('Check list() static method returns array of regions', function() {
    chai.expect(Region.list().length).to.be.equal(10);
    chai.expect(Region.list()).to.be.include(Region.ANY);
    chai.expect(Region.list()).to.be.include(Region.ASIA_PACIFIC_TOKYO);
    chai.expect(Region.list()).to.be.include(Region.ASIA_PACIFIC_SYDNEY);
    chai.expect(Region.list()).to.be.include(Region.ASIA_PACIFIC_SINGAPORE);
    chai.expect(Region.list()).to.be.include(Region.EU_FRANKFURT);
    chai.expect(Region.list()).to.be.include(Region.EU_IRELAND);
    chai.expect(Region.list()).to.be.include(Region.SOUTH_AMERICA_SAO_PAULO);
    chai.expect(Region.list()).to.be.include(Region.US_EAST_N_VIRGINIA);
    chai.expect(Region.list()).to.be.include(Region.US_WEST_N_CALIFORNIA);
    chai.expect(Region.list()).to.be.include(Region.US_WEST_OREGON);
  });

  test('Check all() static method returns array of region alias', function() {
    chai.expect(Region.all().length).to.be.equal(10);
    chai.expect(Region.all()).to.be.include(Region.ANY);
    chai.expect(Region.all()).to.be.include(Region.ASIA_PACIFIC_TOKYO);
    chai.expect(Region.all()).to.be.include(Region.ASIA_PACIFIC_SYDNEY);
    chai.expect(Region.all()).to.be.include(Region.ASIA_PACIFIC_SINGAPORE);
    chai.expect(Region.all()).to.be.include(Region.EU_FRANKFURT);
    chai.expect(Region.all()).to.be.include(Region.EU_IRELAND);
    chai.expect(Region.all()).to.be.include(Region.SOUTH_AMERICA_SAO_PAULO);
    chai.expect(Region.all()).to.be.include(Region.US_EAST_N_VIRGINIA);
    chai.expect(Region.all()).to.be.include(Region.US_WEST_N_CALIFORNIA);
    chai.expect(Region.all()).to.be.include(Region.US_WEST_OREGON);
  });

  test('Check exists() static method returns true if region exists', function() {
    chai.expect(Region.exists('*')).to.be.equal(true);
    chai.expect(Region.exists(Region.US_EAST_N_VIRGINIA)).to.be.equal(true);
  });

  test('Check exists() static method returns false if region doesn\'t exist', function() {
    chai.expect(Region.exists('')).to.be.equal(false);
    chai.expect(Region.exists()).to.be.equal(false);
    chai.expect(Region.exists('eu-region-1')).to.be.equal(false);
  });

  test('Check getAppropriateAwsRegion() static method returns default AWS region as the already existed in availableRegions array', function() {
    chai.expect(Region.getAppropriateAwsRegion(Region.US_EAST_N_VIRGINIA, [Region.US_EAST_N_VIRGINIA])).to.be.equal(Region.US_EAST_N_VIRGINIA);
  });

  test('Check getAppropriateAwsRegion() static method returns approriate AWS region', function() {
    chai.expect(Region.getAppropriateAwsRegion('eu-region-1', [Region.US_WEST_N_CALIFORNIA, Region.US_EAST_N_VIRGINIA, Region.EU_FRANKFURT])).to.be.equal(Region.EU_FRANKFURT);
  });

  test('Check getAppropriateAwsRegion() static method returns approriate AWS region as ANY for default', function() {
    chai.expect(Region.getAppropriateAwsRegion(Region.US_EAST_N_VIRGINIA, [Region.US_WEST_N_CALIFORNIA, Region.US_EAST_N_VIRGINIA, Region.EU_FRANKFURT, Region.ANY])).to.be.equal(Region.US_EAST_N_VIRGINIA);
  });

  test('Check getAppropriateAwsRegion() static method returns approriate AWS region as ANY for default', function() {
    chai.expect(Region.getAppropriateAwsRegion('eu-region-1', [Region.US_WEST_N_CALIFORNIA, Region.US_EAST_N_VIRGINIA])).to.be.equal(Region.US_WEST_N_CALIFORNIA);
  });
});