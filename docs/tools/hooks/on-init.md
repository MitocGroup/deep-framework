On web app init hook
====================

"On init hook" is triggered when an web app is initialized (`deepify` `server/deploy/compile dev`).

> The `Microservice` object is injected in the hook context

Usage
-----

In order to get the hook triggered you have to add an `hook.init.js` file into the microservice root

Example of `${web-app}/${microservice}/hook.init.js` hook file
---------------------------------------------------------------

```javascript
'use strict';

var exports = module.exports = function(callback) {
  var microservice = this.microservice;
  
  // your stuff here...
    
  callback();
};
```
