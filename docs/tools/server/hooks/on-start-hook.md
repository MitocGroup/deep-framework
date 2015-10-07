Server on-start hook
====================

On server start hook is triggered before the development server starts.

> The `Server` object is injected in the hook context

Usage
-----

In order to get the hook triggered you have to add an `hook.server.js` file into the application root

Example of `hook.server.js` hook file
------------------------------------------

```javascript
'use strict';

var exports = module.exports = function(callback) {
	var microservices = this.property.microservices;

	console.log('------------- DISPATCHED MICROSERVICES -------------');

	for (var i = 0; i < microservices.length; i++) {
		var microservice = microservices[i];

		console.log('[' + (i + 1) + '] ' + microservice.identifier);
	}

	console.log('------------- END -------------');

	callback();
};
```