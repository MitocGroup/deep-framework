Post deploy hook
================

"Post deploy hook" is triggered after a application was completely deployed in both cases- on install and update.

> Note that `this.provisioning.config` would be available ONLY on a application installation!

Usage
-----

In order to get the hook triggered you have to add an `hook.post-deploy.js` file into the microservice root

Example of `${web-app}/${microservice}/hook.post-deploy.js` hook file
---------------------------------------------------------------------

```javascript
'use strict';

var exports = module.exports = function(callback) {
  var microservice = this.microservice;
  var provisioning = this.provisioning;

  if (this.isUpdate) {
    console.log('Updating web app...');
  }

  // ...
};
```