Digital Enterprise End-to-end Platform
======================================

[![NPM Version](https://img.shields.io/npm/v/deep-framework.svg)](https://npmjs.org/package/deep-framework)
[![Build Status](https://travis-ci.org/MitocGroup/deep-framework.svg)](https://travis-ci.org/MitocGroup/deep-framework)
[![Codacy Badge](https://api.codacy.com/project/badge/823d04a90c4a4fc888e62817e3e820be)](https://www.codacy.com/app/MitocGroup/deep-framework)
[![Coverage Status](https://coveralls.io/repos/MitocGroup/deep-framework/badge.svg?service=github)](https://coveralls.io/github/MitocGroup/deep-framework)
[![API Docs](http://docs.deep.mg/badge.svg)](http://docs.deep.mg)

`Digital Enterprise End-to-end Platform`, also known as `DEEP`, is low cost and low maintenance 
[Platform-as-a-Service](https://en.wikipedia.org/wiki/Platform_as_a_service) powered by abstracted web services 
from cloud providers like [Amazon Web Services](https://aws.amazon.com). This approach has been labeled as
[Serverless Architecture](https://github.com/MitocGroup/deep-framework/blob/master/README.md#appendix-a-serverless-architecture).

`DEEP Framework` is a [core component](https://github.com/MitocGroup/deep-framework/blob/master/README.md#appendix-b-deep-components)
of the Platform-as-a-Service that abstracts web services from specific cloud providers. At this moment 
only [Amazon Web Services](https://aws.amazon.com) is supported. Developers are encouraged to add support for
[Microsoft Azure](https://azure.microsoft.com), [Google Cloud Platform](https://cloud.google.com/), and so on.

## Introduction [![Join char on gitter.im](https://img.shields.io/badge/%E2%8A%AA%20gitter%20-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/MitocGroup/deep-framework)

`DEEP Framework` is a nodejs package that is published on npmjs: https://www.npmjs.com/package/deep-framework.
If you are new to node and npm, check out [this tutorial](http://howtonode.org/how-to-install-nodejs) to learn more.

`DEEP Framework` is a nodejs package. In fact it's a collection of nodejs packages, also known as
`DEEP Abstracted Libraries`. Here below is the complete list:

DEEP Abstracted Library | Description and Documentation | Abstracted Web Service(s)
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

## Getting Started [![Join char on gitter.im](https://img.shields.io/badge/%E2%8A%AA%20gitter%20-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/MitocGroup/deep-framework)

If `DEEP Framework` is intended to be used globally, just run in command line:

```
npm install deep-framework -g
```

Alternatively, if used as dependency, include it in `package.json` file. For example:

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

## Examples [![Join char on gitter.im](https://img.shields.io/badge/%E2%8A%AA%20gitter%20-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/MitocGroup/deep-framework)

There are couple of web apps that are using `DEEP Framework` at their core:

### DEEP Microservices Hello World
> DEEP Microservices Hello World (https://github.com/MitocGroup/deep-microservices-helloworld) is a web app
that show cases a full stack example of using DEEP Microservices in the context of Platform-as-a-Service.
Developers can either fork this repository or `npm install deepify -g` (https://www.npmjs.com/package/deepify)
and run in the command line `deepify helloworld ~/deep-hello-world`.

### DEEP Microservices Todo App
> DEEP Microservices Todo App (https://github.com/MitocGroup/deep-microservices-todo-app) is a web app
inspired from AngularJS TodoMVC Example (https://github.com/tastejs/todomvc/tree/master/examples/angularjs).
It reuses AngularJS module and integrates using `DEEP Framework` to streamline development and deployment
using cloud-based web services.

### DEEP Marketplace
> DEEP Marketplace (https://www.deep.mg) is Software-as-a-Service, built on top of DEEP, that empowers customers
to choose functionality from listed microservices and deploy them together as an web app into their own 
AWS accounts with just few clicks; as well as empowers developers to create and publish their microservices 
and monetize them in similar approach to Apple's App Store.

## Continuous Integration [![Join char on gitter.im](https://img.shields.io/badge/%E2%8A%AA%20gitter%20-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/MitocGroup/deep-framework)

### Travis CI [![Build Status](https://travis-ci.org/MitocGroup/deep-framework.svg)](https://travis-ci.org/MitocGroup/deep-framework)

[Travis CI](https://travis-ci.org/MitocGroup/deep-framework) is a continuous integration service used to build and 
testprojects hosted on GitHub. Travis CI is configured by adding a file named 
[.travis.yml](https://github.com/MitocGroup/deep-framework/blob/master/.travis.yml), which is a YAML format text file,
to the root directory of the GitHub repository.

### Codacy [![Codacy Badge](https://api.codacy.com/project/badge/823d04a90c4a4fc888e62817e3e820be)](https://www.codacy.com/app/MitocGroup/deep-framework)

[Codacy](https://www.codacy.com/app/MitocGroup/deep-framework) offers an automated code review tool for developers 
that continuously monitors code for problematic patterns, with the aim being to reduce the amount of time spent 
poring over code style.

### Coveralls [![Coverage Status](https://coveralls.io/repos/MitocGroup/deep-framework/badge.svg?service=github)](https://coveralls.io/github/MitocGroup/deep-framework)

[Coveralls](https://coveralls.io/github/MitocGroup/deep-framework) provides constant updates on your project's 
automated test coverage. It is now available for open source projectsto start tracking code coverage on project.

### ESDoc [![API Docs](http://docs.deep.mg/badge.svg)](http://docs.deep.mg)

[ESDoc](https://esdoc.org) is a documentation generator for JavaScript(ES6). It produces a practical documentation, 
measures the coverage, integrates the test code and more.

## Involvement && Help [![Join char on gitter.im](https://img.shields.io/badge/%E2%8A%AA%20gitter%20-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/MitocGroup/deep-framework)

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

### Changelog

Changelog files are located in `/changelog` folder.
> See [CHANGELOG.md](https://github.com/MitocGroup/deep-framework/blob/master/CHANGELOG.md) for latest changelog.

### License

This repository can be used under the MIT license.
> See [LICENSE](https://github.com/MitocGroup/deep-framework/blob/master/LICENSE) for more details.

### Sponsors

This repository is being sponsored by:
> [Mitoc Group](http://www.mitocgroup.com)

## Appendices

### Appendix A: Serverless Architecture

![Digital Enterprise End-to-end Platform aka DEEP](https://raw.githubusercontent.com/MitocGroup/deep-framework/master/docs/deep-architecture.png)

### Appendix B: DEEP Components

![Digital Enterprise End-to-end Platform aka DEEP](https://raw.githubusercontent.com/MitocGroup/deep-framework/master/docs/deep-ecosystem.png)
