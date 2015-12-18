Server before/after start hook
==============================

"On server start hook" is triggered before the development server starts.

> The `Server` object is injected in the hook context

Usage
-----

In order to get the hook triggered you have to add an `hook.server.js` file into the application root

Example of `${web-app}/hook.server.js` hook file
------------------------------------------------

```javascript
'use strict';

var exports = module.exports = function(callback) {
	var server = this.server;

	if (this.isBefore()) {
		console.log('Triggered before the server have started...');
	} elseif (this.isAfter()) {
		console.log('Triggered after the server have started...');
	}
	
	// ...
};
```