DEEP Framework (deep-framework)
==============

[![NPM Version](https://img.shields.io/npm/v/deep-framework.svg)](https://npmjs.org/package/deep-framework)
[![Build Status](https://travis-ci.org/MitocGroup/deep-framework.svg?branch=master)](https://travis-ci.org/MitocGroup/deep-framework)
[![Codacy Badge](https://api.codacy.com/project/badge/coverage/823d04a90c4a4fc888e62817e3e820be)](https://www.codacy.com/app/MitocGroup/deep-framework)
[![API Docs](http://docs.deep.mg/badge.svg)](http://docs.deep.mg)

`DEEP Framework` is a serverless web framework, core component of the 
[Platform-as-a-Service](https://github.com/MitocGroup/deep-framework/blob/master/README.md#appendix-b-deep-ecosystem) 
that abstracts web apps and web services from specific cloud providers. This framework enables developers build
cloud-native applications or platforms using [microservices architecture](https://en.wikipedia.org/wiki/Microservices) 
in a completely [serverless approach](https://github.com/MitocGroup/deep-framework#appendix-a-serverless-architecture). 

> At this moment only [Amazon Web Services](https://aws.amazon.com) is supported. Developers are encouraged to add support 
for [Microsoft Azure](https://azure.microsoft.com), [Google Cloud Platform](https://cloud.google.com/), and so on.

## Getting Started [![Join char on gitter.im](https://img.shields.io/badge/%E2%8A%AA%20gitter%20-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/MitocGroup/deep-framework)

`DEEP Framework` can be used as a module in front-end or back-end. To learn more, scroll down to 
[What is DEEP Framework?](https://github.com/MitocGroup/deep-framework/blob/master/README.md#what-is-deep-framework-)

To see the power of `DEEP Framework`, execute the following 4 simple steps in command line:

1. Install DEEP CLI, also known as deepify:

  `npm install deepify -g` 
> deepify is a collection of tools that empower developers and devops engineers to automate
the management of web apps built on top of DEEP ecosystem.

2. Using deepify, dump locally the helloworld example:

  `deepify helloworld ~/deep-hello-world`
> deepify will clone the repository from GitHub and pull all the dependencies in one place.

3. Using deepify, run locally the helloworld example:

  `deepify server ~/deep-hello-world -o`
> deepify launches a web server that can be used for local development, without making calls
to web services from cloud providers like AWS.

4. Using deepify, deploy to AWS the helloworld example:

  `deepify deploy ~/deep-hello-world`
> deepify provisions the infrastructure and deploys the web app, empowering developers and
devops engineers to automate the process.

To learn more about helloworld example, or other web apps that run in production, scroll down to 
[Who is using DEEP Framework?](https://github.com/MitocGroup/deep-framework/blob/master/README.md#who-is-using-deep-framework-)

### Additional Notes
Note 1: To use `DEEP Framework` globally, just run in command line:
```
npm install deep-framework -g
```

Note 2: Alternatively, to use `DEEP Framework` as dependency, include it in `package.json` file. For example:
```
{
  "name": "say-hello-world",
  "version": "0.0.1",
  "description": "AWS Lambda that says hello to the world",
  "dependencies": {
    "deep-framework": "1.0.*",
    ...
  },
  ...
}
```

## What is DEEP Framework? [![Join char on gitter.im](https://img.shields.io/badge/%E2%8A%AA%20gitter%20-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/MitocGroup/deep-framework)

`DEEP Framework` is a nodejs package that is published on npmjs: https://www.npmjs.com/package/deep-framework.

> If you are new to node and npm, check out [how to install nodejs](http://howtonode.org/how-to-install-nodejs) tutorial.

`DEEP Framework` is a nodejs package. In fact it's a collection of nodejs packages, also known as
`DEEP Abstracted Libraries`. Here below is the complete list:

DEEP Abstracted Library | [Api Docs](http://docs.deep.mg/) | Abstracted Web Service(s)
------------------------|-------------------------------|--------------------------
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

## Who is using DEEP Framework? [![Join char on gitter.im](https://img.shields.io/badge/%E2%8A%AA%20gitter%20-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/MitocGroup/deep-framework)

There are couple examples / web apps that are using `DEEP Framework` at their core:

### DEEP Hello World
> DEEP Hello World (https://github.com/MitocGroup/deep-microservices-helloworld) is a web app
that show cases a full stack example of using DEEP Microservices in the context of Platform-as-a-Service.
Developers can either fork this repository or `npm install deepify -g` (https://www.npmjs.com/package/deepify)
and run in the command line `deepify helloworld ~/deep-hello-world`.

### DEEP Todo App
> DEEP Todo App (https://github.com/MitocGroup/deep-microservices-todo-app) is a web app inspired from 
AngularJS TodoMVC Example (https://github.com/tastejs/todomvc/tree/master/examples/angularjs).
It reuses AngularJS module and integrates using `DEEP Framework` to streamline development and deployment
using cloud-based web services.

### DEEP Marketplace
> DEEP Marketplace (https://www.deep.mg) is Software-as-a-Service, built on top of DEEP, that empowers customers
to choose functionality from listed microservices and deploy them together as an web app into their own 
AWS accounts with just few clicks; as well as empowers developers to create and publish their microservices 
and monetize them in similar approach to Apple's App Store.

## How can I get involved? [![Join char on gitter.im](https://img.shields.io/badge/%E2%8A%AA%20gitter%20-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/MitocGroup/deep-framework)

### Feedback

We are eager to get your feedback, so please use whatever communication channel you prefer:
- [github issues](https://github.com/MitocGroup/deep-framework/issues)
- [gitter chat room](https://gitter.im/MitocGroup/deep-framework)
- [deep email address](mailto:feedback@deep.mg)

### Contribution

This project is open source, and we encourage developers to contribute. Here below is the easiest way to do so:

1. [Fork](http://help.github.com/forking/) this repository in GitHub.
2. Develop the feature in your repository. Make one or more commits to your repository in GitHub.
3. Perform a [pull request](http://help.github.com/pull-requests/) from your repository back into original repository in GitHub.

Make sure you update `package.json` (or `deepkg.json`, depends on the use case) and put your name and contact information in contributors section. We would like to recognize the work and empower every contributor in creative ways :)

### Roadmap

Our short-to-medium-term roadmap items, in order of descending priority:

Feature | Details | Owner
--------|---------|------
Implement deep-security | Security service on top of [IAM](https://aws.amazon.com/iam/) | [@mgoria](https://github.com/mgoria)
Implement deep-notification | Push notification service on top of [SNS](https://aws.amazon.com/sns/) that supports push to mobile devices, web browsers, email and sms. | [@alexanderc](https://github.com/alexanderc)
Implement deep-search | Full text search service on top of [Amazon CloudSearch](https://aws.amazon.com/cloudsearch/) | [@alexanderc](https://github.com/alexanderc)
Implement deep-event | Event manager service using Lambda scheduling, Kinesis stream, Dynamo streaming, SQS, etc. | ...
Implement deep-db "eventual consistency" | Achieve "eventual consistency" by offloading data to [SQS](https://aws.amazon.com/sqs/) as the default option | [@alexanderc](https://github.com/alexanderc)
Improve deep-db "strong consistency" | Achieve "strong consistency" by increasing Reads/Writes per second in runtime (as other option for special DB operations) | ...
Integrate deep-db with deep-cache natively (blocked by VPC support in Lambda) | Cache fetched data by default using deep-cache library | ...
Implement deep-cache | Cache service on top of [Elasticache](https://aws.amazon.com/elasticache/) ([Redis](http://redis.io)) inside Lambdas (blocked by VPC support in Lambda) | ...
Implement [RUM](https://en.wikipedia.org/wiki/Real_user_monitoring) as part of deep-logs | Achieve real user monitoring by logging all user actions and visualize them with an [ELK stack](https://www.elastic.co/webinars/introduction-elk-stack) | ...
Optimize the framework to reduce the size of Lambda functions | Optimize deps and packing as well as browserify process to reduce framework size | [@alexanderc](https://github.com/alexanderc)
Improve documentation for each deep-* library | Update docs for deep libraries and development tools | [@alexanderc](https://github.com/alexanderc) [@mgoria](https://github.com/mgoria)

### Changelog

Changelog files are located in `/changelog` folder.
> See [CHANGELOG.md](https://github.com/MitocGroup/deep-framework/blob/master/CHANGELOG.md) for latest changelog.

### License

This repository can be used under the MIT license.
> See [LICENSE](https://github.com/MitocGroup/deep-framework/blob/master/LICENSE) for more details.

### Sponsors

This repository is being sponsored by:
> [Mitoc Group](http://www.mitocgroup.com)

## What else is relevant? [![Join char on gitter.im](https://img.shields.io/badge/%E2%8A%AA%20gitter%20-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/MitocGroup/deep-framework)

`Digital Enterprise End-to-end Platform`, also known as `DEEP`, is low cost and low maintenance 
[Platform-as-a-Service](https://en.wikipedia.org/wiki/Platform_as_a_service) powered by abstracted web services 
from cloud providers like [Amazon Web Services](https://aws.amazon.com). This approach has been labeled as
[Serverless Architecture](https://github.com/MitocGroup/deep-framework/blob/master/README.md#appendix-a-serverless-architecture).

### Appendix A: Serverless Architecture

![Digital Enterprise End-to-end Platform aka DEEP](https://raw.githubusercontent.com/MitocGroup/deep-framework/master/docs/deep-architecture.png)

`DEEP` is an ecosystem of [DEEP Marketplace](https://www.deep.mg), 
[DEEP Framework](https://github.com/MitocGroup/deep-framework) and [DEEP CLI](https://www.npmjs.com/package/deepify),
also known as [deepify](https://www.npmjs.com/package/deepify). It enables developers build serverless applications 
using abstracted services from cloud providers like [Amazon Web Services](https://aws.amazon.com).

### Appendix B: DEEP Ecosystem

![Digital Enterprise End-to-end Platform aka DEEP](https://raw.githubusercontent.com/MitocGroup/deep-framework/master/docs/deep-ecosystem.png)

`DEEP` aims to remove the heavy lifting from enterprise software through microservices architecture, where developers
(let’s label them `lego producers`) focus only to build microservices (let’s label them `lego pieces`), while the platform 
does the rest: comes pre-built and pre-scaled, low-cost and low-maintenance, very secure and very fast. Customers 
(let’s label them `lego consumers`) will go to the marketplace, choose the microservices they need and deploy them 
as web apps into their own accounts on AWS (or other cloud providers).

> In summary: We empower lego consumers to license curated lego pieces from a marketplace of lego producers.
