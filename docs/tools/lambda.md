Local Lambda execution
======================

This tool mimics AWS Lambda NodeJS environment to run lambdas locally.

> To be able to use `deepify lambda` command you have to install globally `deep-package-manager` module

It is reading by default `.aws.json` config from lambda root folder to set up `aws-sdk` instance to run correctly.
The content should be an json object with the native AWS configuration structure 
(refer to [AWS docs](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html)).

Usage example
-------------

```bash
~#: deepify lambda tests/lambda/handler_hello.js --event='{"name":"Developer"}'
```

> `tests/lambda/handler_hello.js` is the path to the handler that contains `exports.handler`.
> Note that `.../bootstrap.js` is the default file name if a directory provided

> '{"name":"Developer"}' is the JSON object provided as the lambda payload


Example of `.aws.json`
----------------------

```json
{
  "accessKeyId": "AKIAI6Z72HOXE3MGXEOQ",
  "secretAccessKey": "0x+4Yb6XfKZGCvIYsWYAGdrd8XEElnZiG9Vbl47a",
  "region": "us-west-2",
  "httpOptions": {
    "timeout": 10000
  }
}
```

Example of test lambda
----------------------

```javascript
exports.handler = function(event, context) {
    console.log('Hello ' + (event.name || 'World') + '!');

    context.succeed({
        status: 'OK'
    });
};
```