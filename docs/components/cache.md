deep-cache
=========

> In backend is used AWS ElastiCache Redis cluster and in frontend the local storage (backend cache is not supported yet by AWS)

Examples
--------

```javascript
var app = DeepFramework.Kernel;
var cache = app.get('cache');
var customCacheDriver = app.get('cache.prototype').createDriver('memory' /*, ...args */);

cache.namespace = 'some_prefix_';
cache.silent = true; // Don't throw an exception when calling method "get" if key doesn't exist

cache.has('name', function(exception, result) {
    if (result) {
        console.log(`The key 'name' exists in cache`);
    }
});

cache.get('name', function(exception, result) {
    if (exception) {
        console.log('Unable to retrieve cached item', exception);
    } else {
        console.log(`My name is ${result}`);
    }
});

cache.set('name', 'AlexanderC', 60, function(exception, result) {
    if (exception) {
        console.log('Unable to persist item in cache', exception);
    } else {
        console.log(`My name is stored as AlexanderC for 1 minute`);
    }
});

cache.invalidate('name', 60, function(exception, result) {
    if (exception) {
        console.log('Unable to invalidate cached item', exception);
    } else {
        console.log(`My name would be invalidated in a minute`);
    }
});

// This is not implemented by all drivers
cache.flush(function(exception, result) {
    if (exception) {
        console.log('Unable to clean up the cache', exception);
    } else {
        console.log(`There are no more item stored in the cache`);
    }
});

```
