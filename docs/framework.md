deep-framework
==============

DEEP Framework is a nodejs package that is published on npmjs: https://www.npmjs.com/package/deep-framework.

In fact, this framework is a collection of nodejs packages, also identifiable as abstracted libraries:

[DEEP Framework](https://www.npmjs.com/package/deep-framework) | [API Docs](http://docs.deep.mg) | Abstracted Web Service(s)
---------------------------------------------------------------|---------------------------------|--------------------------
[deep-asset](https://www.npmjs.com/package/deep-asset) | [Assets Management Library](http://docs.deep.mg/deep-asset) | Amazon S3
[deep-cache](https://www.npmjs.com/package/deep-cache) | [Cache Management Library](http://docs.deep.mg/deep-cache) | Amazon ElastiCache
[deep-core](https://www.npmjs.com/package/deep-core) | [Core Management Library](http://docs.deep.mg/deep-core) | -
[deep-db](https://www.npmjs.com/package/deep-db) | [Database Management Library](http://docs.deep.mg/deep-db) | Amazon DynamoDB, Amazon SQS
[deep-di](https://www.npmjs.com/package/deep-di) | [Dependency Injection Management Library](http://docs.deep.mg/deep-di) | -
[deep-event](https://www.npmjs.com/package/deep-event) | [Events Management Library](http://docs.deep.mg/deep-event) | Amazon Kinesis
[deep-fs](https://www.npmjs.com/package/deep-fs) | [File System Management Library](http://docs.deep.mg/deep-fs) | Amazon S3
[deep-kernel](https://www.npmjs.com/package/deep-kernel) | [Kernel Management Library](http://docs.deep.mg/deep-kernel) | -
[deep-log](https://www.npmjs.com/package/deep-log) | [Logs Management Library](http://docs.deep.mg/deep-log) | Amazon CloudWatch Logs
[deep-notification](https://www.npmjs.com/package/deep-notification) | [Notifications Management Library](http://docs.deep.mg/deep-notification) | Amazon SNS
[deep-resource](https://www.npmjs.com/package/deep-resource) | [Resouces Management Library](http://docs.deep.mg/deep-resource) | AWS Lambda, Amazon API Gateway
[deep-security](https://www.npmjs.com/package/deep-security) | [Security Management Library](http://docs.deep.mg/deep-security) | AWS IAM, Amazon Cognito
[deep-validation](https://www.npmjs.com/package/deep-validation) | [Validation Management Library](http://docs.deep.mg/deep-validation) | -


The Anatomy of DEEP Framework
-----------------------------

Each DEEP framework module except the basis (`deep-core`) uses `deep-kernel` and `deep-di`.

`deep-kernel` enforces each module to extend a `Kernel.ContainerAware` abstract class
that is loaded in runtime into a service.

> `deep-kernel` transforms each module into a service (ex. `deep-db` as `db`, `deep-log` as `logs` etc.)

`Kernel.ContainerAware` makes possible you to bind a microservice instance using `.bind(microserviceObject)` method.

> Be aware- a service action that requires a `microservice` would throw an error if it is missing


Initializing and using the app
------------------------------

```javascript
import deep-framework from 'deep-framework';

DeepFramework.Kernel.bootstrap((kernel) => {
    // your application was initialized
    
    let fs = kernel.get('fs'); // deep-fs service
    let asset = kernel.get('asset'); // deep-asset service
    
    let helloWorldMicroservice = kernel.microservice('deep.microservices.helloworld'); // microservice instance
    let currentMicroservice = kernel.microservice(); // current microservice instance
    
    let iconPath = asset.locate('@deep.microservices.helloworld:images/icon.png');
});
```

> Note that mainly all the services implements `path resolving feature`: `'@xxxx:yyyy'` where `xxxx` is the
> microservice identifier and `yyyy` is some service specific descriptor
