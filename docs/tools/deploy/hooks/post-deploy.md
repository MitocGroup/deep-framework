Post deploy hook
================

Post deploy hook is triggered after a application was completely deployed in both cases- on install and update.

> Note that `this.provisioning.config` would be available ONLY on a application installation!

Usage
-----

In order to get the hook triggered you have to add an `hook.post-deploy.js` file into the microservice root

Example of `hook.post-deploy.js` hook file
------------------------------------------

```javascript
'use strict';

var exports = module.exports = function(callback) {
  var microservice = this.microservice;
  var provisioning = this.provisioning;

  if (this.isUpdate) {
    console.log('Update! Skipping public bucket location retrieval post deploy hook...');

    callback();
    return;
  }

  console.log('Start retrieving public bucket location in "' + microservice.identifier + '" post deploy hook.');

  var s3 = provisioning.s3;
  var publicBucket = provisioning.config.s3.buckets.public.name;

  s3.getBucketLocation({Bucket: publicBucket}, function(error, data) {
    if (error) {
      console.error('Error while retrieving public bucket(' + publicBucket + ') location: ' + error);
    } else {
      var region = data.LocationConstraint || 'unknown';

      console.log('Public bucket(' + publicBucket + ') is located in "' + region + '" region.');
    }

    callback();
  }.bind(this));
};
```