DEEP Cache Library (deep-cache)
==============

[![NPM Version](https://img.shields.io/npm/v/deep-framework.svg)](https://npmjs.org/package/deep-framework)
[![Build Status](https://travis-ci.org/MitocGroup/deep-framework.svg?branch=master)](https://travis-ci.org/MitocGroup/deep-framework)
[![Codacy Badge](https://api.codacy.com/project/badge/coverage/823d04a90c4a4fc888e62817e3e820be)](https://www.codacy.com/app/MitocGroup/deep-framework)
[![API Docs](http://docs.deep.mg/badge.svg)](http://docs.deep.mg)

DEEP Framework is a full-stack web framework for building cloud-native web applications.

> This framework is a core component of a larger ecosystem, called
[Digital Enterprise End-to-end Platform](https://github.com/MitocGroup/deep-framework/blob/master/docs/index.md).

Using DEEP Framework, developers get out-of-the-box:

- streamlined "production-like" development environment
- enterprise-level platform using microservices architecture
- virtually infinite scalability with zero devops (aka *serverless computing*)
- abstracted use of web services from cloud providers (e.g. AWS, GCP, etc.)

> [Amazon Web Services](https://aws.amazon.com) is the only supported cloud provider at the moment.
Help needed to add support for [Google Cloud Platform](https://cloud.google.com/),
[Microsoft Azure](https://azure.microsoft.com), and others.

Documentation is available at [docs.deep.mg](http://docs.deep.mg).


## Getting Started

Install DEEP CLI, also known as deepify:

```bash
npm install deepify -g
```

> If you want to use `deepify` on Windows, please follow the steps from
[Windows Configuration](https://github.com/MitocGroup/deep-framework/blob/master/docs/windows.md)
before running `npm install deepify -g` and make sure all `npm` and `deepify` commands are executed
inside Git Bash.

Using deepify, dump locally the helloworld example:

```bash
deepify helloworld ~/deep-hello-world
```

> This command is equivalent to the generic command used globally:
`deepify install github://MitocGroup/deep-microservices-helloworld ~/deep-hello-world`

Next, run locally the helloworld project:

```bash
deepify server ~/deep-hello-world -o
```

> When this step is finished, you can open in your browser the link *http://localhost:8000*
and enjoy the helloworld project running locally.

Finally, deploy the helloworld to cloud provider:

```bash
deepify deploy ~/deep-hello-world
```

> Amazon CloudFront distribution takes up to 20 minutes to provision, therefore don’t worry
if it returns an HTTP error in the first couple of minutes.


## What is DEEP Framework?

DEEP Framework is a nodejs package that is published on npmjs: https://www.npmjs.com/package/deep-framework.

> If you are new to node and npm, check out the tutorial [how to install nodejs](http://howtonode.org/how-to-install-nodejs).

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


## Who is using DEEP Framework?

There are couple examples / web applications that are built on top of DEEP Framework:

### DEEP Hello World
[DEEP Hello World](https://github.com/MitocGroup/deep-microservices-helloworld) is a web app
that show cases a full stack example of using DEEP Microservices in the context of Platform-as-a-Service.
Developers can either fork this repository or `npm install deepify -g` and run in the command line
`deepify helloworld ~/deep-hello-world`.

### DEEP Todo App
[DEEP Todo App](https://github.com/MitocGroup/deep-microservices-todo-app) is a web app inspired from 
[AngularJS TodoMVC Example](https://github.com/tastejs/todomvc/tree/master/examples/angularjs).
It reuses AngularJS module and integrates using DEEP Framework to streamline development and deployment
using cloud-based web services.

### DEEP Marketplace
[DEEP Marketplace](https://www.deep.mg) is Software-as-a-Service for enterprise software, built on top of DEEP,
that empowers customers to choose functionality from listed microservices and deploy them together as an web app
into their own AWS accounts with just few clicks; as well as empowers developers to create and publish their 
microservices and monetize them in similar approach to Apple's App Store.


## Developer Resources

Building an application with DEEP Framework?

- Ask questions: https://stackoverflow.com/questions/tagged/deep-framework
- Chat with us: https://gitter.im/MitocGroup/deep-framework
- Send messages: feedback@deep.mg

Interested in contributing to DEEP Framework?

- Contributing: https://github.com/MitocGroup/deep-framework/blob/master/CONTRIBUTING.md
- Issue tracker: https://github.com/MitocGroup/deep-framework/issues
- Roadmap: https://github.com/MitocGroup/deep-framework/blob/master/ROADMAP.md
- Changelog: https://github.com/MitocGroup/deep-framework/blob/master/CHANGELOG.md


## Sponsors

This repository is being sponsored by:
- [Mitoc Group](https://www.mitocgroup.com)
- [DEEP Marketplace](https://www.deep.mg)

The code can be used under the MIT license:
> See [LICENSE](https://github.com/MitocGroup/deep-framework/blob/master/LICENSE) for more details.
