deep-log
========

Basic usage
-----------

```javascript
let app = DeepFramework.Kernel;
let log = app.get('log');
    
log.log('sample error', 'error', {sample_context_var: 'some value'});
     
/**
    ==== Available levels ====

    Log.EMERGENCY -> emergency
    Log.ALERT -> alert
    Log.CRITICAL -> critical
    Log.ERROR -> error
    Log.WARNING -> warning
    Log.NOTICE -> notice
    Log.INFO -> info
    Log.DEBUG -> debug
*/
```

Working with drivers
--------------------

```javascript
let log = app.get('log');

let sentryDsn = 'https://ljh3bohb3l5jhb3kjh5bhbkjhbjjtfiytjv@app.getsentry.com/12345';

let consoleDriver = log.create('console');
let sentryDriver = log.create('sentry', sentryDsn); // aka raven

// register drivers first
log
    .register(consoleDriver)
    .register(sentryDriver)
    // .register('console')
    
console.log(log.drivers); // the list of available drivers
    
log.log('sample error', 'error', {sample_context_var: 'some value'});
```