Digital Enterprise End-to-end Platform
======================================

[![NPM Version](https://img.shields.io/npm/v/deep-framework.svg)](https://npmjs.org/package/deep-framework)
[![Build Status](https://travis-ci.org/MitocGroup/deep-framework.svg)](https://travis-ci.org/MitocGroup/deep-framework)
[![Codacy Badge](https://api.codacy.com/project/badge/823d04a90c4a4fc888e62817e3e820be)](https://www.codacy.com/app/MitocGroup/deep-framework)
[![Coverage Status](https://coveralls.io/repos/MitocGroup/deep-framework/badge.svg?service=github)](https://coveralls.io/github/MitocGroup/deep-framework)
[![API Docs](http://docs.deep.mg/badge.svg)](http://docs.deep.mg)

`Digital Enterprise End-to-end Platform`, also known as `DEEP`, is low cost and low maintenance 
[Platform-as-a-Service](https://en.wikipedia.org/wiki/Platform_as_a_service) powered by abstracted web services 
from cloud providers like [Amazon Web Services](https://aws.amazon.com). Lately, this approach has been labeled as
[Serverless Architecture](https://aws.amazon.com/blogs/compute/microservices-without-the-servers/).

`DEEP Framework` is a component of `DEEP` that abstracts web services from specific cloud providers. At this moment
it only supports `Amazon Web Services`. Therefore we would like to encourage other developers to add support for 
`Microsoft Azure`, and `Google Cloud Platform`, and so on.

## Getting Started [![Join char on gitter.im](https://img.shields.io/badge/%E2%8A%AA%20gitter%20-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/MitocGroup/deep-framework)

`DEEP Framework` is a nodejs package that is published on [npmjs.com](https://www.npmjs.com/package/deep-framework).
If you are new to node and npm, check out [this tutorial](http://howtonode.org/how-to-install-nodejs) to learn more.

If `DEEP Framework` is intended to be used globally, just run `npm install deep-framework -g` in command line.
Alternatively, if used as dependency, include it in `package.json` file:

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

`DEEP Framework` is a nodejs package, but in fact it's a collection of nodejs packages, also known as abstracted libraries.
Here below is the complete list:

DEEP Abstracted Library | Description of DEEP Library | AWS Abstracted Service(s)
------------------------|-----------------------------|--------------------------
[deep-asset](http://docs.deep.mg/deep-asset) | Assets Management Library | Amazon S3
[deep-cache](http://docs.deep.mg/deep-cache) | Cache Management Library | Amazon ElastiCache
[deep-core](http://docs.deep.mg/deep-core) | Core Management Library | -
[deep-db](http://docs.deep.mg/deep-db) | Database Management Library | Amazon DynamoDB, Amazon SQS
[deep-di](http://docs.deep.mg/deep-di) | Dependency Injection Management Library | -
[deep-event](http://docs.deep.mg/deep-event) | Events Management Library | Amazon Kinesis
[deep-fs](http://docs.deep.mg/deep-fs) | File System Management Library | Amazon S3
[deep-kernel](http://docs.deep.mg/deep-kernel) | Kernel Management Library | -
[deep-log](http://docs.deep.mg/deep-log) | Logs Management Library | Amazon CloudWatch Logs
[deep-notification](http://docs.deep.mg/deep-notification) | Notifications Management Library | Amazon SNS
[deep-resource](http://docs.deep.mg/deep-resource) | Resouces Management Library | AWS Lambda, Amazon API Gateway
[deep-security](http://docs.deep.mg/deep-security) | Security Management Library | AWS IAM, Amazon Cognito
[deep-validation](http://docs.deep.mg/deep-validation) | Validation Management Library | -

## DEEP for Businesses [![Join char on gitter.im](https://img.shields.io/badge/%E2%8A%AA%20gitter%20-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/MitocGroup/deep-framework)

#### User Guide Documentation (to be updated later)

DEEP is enabling small and medium businesses, as well as enterprises to:
- Rent applications on a monthly basis by needed functionality from [DEEP Marketplace](https://www.deep.mg)
- Choose applications by desired features and deploy them securely in their own accounts from cloud providers like AWS
- Pay only for subscribed applications and stop paying when unsubscribing and not using anymore
- Run secured, self-service applications with beautiful user interfaces and intuitively simple user experiences
- Empower none technical teams to solve business problems through technology, without waiting on technical teams' availability

> [DEEP Marketplace](https://www.deep.mg) (aka [www.deep.mg](https://www.deep.mg)) is a web application built using DEEP and published on serverless environment from [Amazon Web Services](https://aws.amazon.com) (aka [aws.amazon.com](https://aws.amazon.com)). We make it faster and easier for developers to build and publish their software, as well as for businesses to discover and test applications they are looking for. Our goal is to connect businesses with developers, and empower technical teams to build self-service software that none technical teams could use. The marketplace is like Apple's App Store for web applications that run natively on cloud providers like AWS.

## DEEP for Developers [![Join char on gitter.im](https://img.shields.io/badge/%E2%8A%AA%20gitter%20-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/MitocGroup/deep-framework)

#### [API Guide Documentation](http://docs.deep.mg)
#### [Developer Guide Documentation](https://github.com/MitocGroup/deep-framework/blob/master/docs/index.md)

DEEP is enabling developers and architects to:
- Design microservices architecture on top of serverless environments from cloud providers like AWS
- Build distributed software that combines and manages hardware and software in the same microservice
- Use the framework's abstracted approach to build applications that could be cloud agnostic
- Build cloud native JavaScript applications that combine and manage frontend, backend and database layers in the same [DEEP Microservice](https://github.com/MitocGroup/deep-framework/blob/master/docs/microservice.md)
- Run in the cloud the software that was built by distributed teams and served self-service in large organizations
- Monetize their work of art by uploading microservices to [DEEP Marketplace](https://www.deep.mg)

> [DEEP Microservice](https://github.com/MitocGroup/deep-framework/blob/master/docs/microservice.md) is the predefined structure of a microservice (an application) in DEEP. There is clear separation between frontend, backend and database, as well as unit tests and documentation. Developers are encoraged to get started with [DEEP Microservices HelloWorld](https://github.com/MitocGroup/deep-microservices-helloworld) or [DEEP Microservices ToDo App](https://github.com/MitocGroup/deep-microservices-todo-app), as well as [DEEP CLI](https://www.npmjs.com/package/deepify) (aka `deepify`).

> [DEEP Marketplace](https://www.deep.mg) (aka [www.deep.mg](https://www.deep.mg)) is a web application built using DEEP and published on serverless environment from [Amazon Web Services](https://aws.amazon.com) (aka [aws.amazon.com](https://aws.amazon.com)). We make it faster and easier for developers to build and publish their software, as well as for businesses to discover and test applications they are looking for. Our goal is to connect businesses with developers, and empower technical teams to build self-service software that none technical teams could use. The marketplace is like Apple's App Store for web applications that run natively on cloud providers like AWS.

## DEEP Architecture on AWS [![Join char on gitter.im](https://img.shields.io/badge/%E2%8A%AA%20gitter%20-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/MitocGroup/deep-framework)

DEEP is using [microservices architecture](https://en.wikipedia.org/wiki/Microservices) on serverless environments from cloud providers like AWS. DEEP Framework abstracts the functionality and makes it completely developer friendly. 

## Feedback

We are eager to get your feedback, so please use whatever communication channel you prefer:
- [github issues](https://github.com/MitocGroup/deep-framework/issues)
- [gitter chat room](https://gitter.im/MitocGroup/deep-framework)
- [deep email address](mailto:feedback@deep.mg)

## Contribution

This project is open source, and we encourage developers to contribute. Here below is the easiest way to do so:

1. [Fork](http://help.github.com/forking/) this repository in GitHub.
2. Develop the feature in your repository. Make one or more commits to your repository in GitHub.
3. Perform a [pull request](http://help.github.com/pull-requests/) from your repository back into original repository in GitHub.

Make sure you update `package.json` (or `deepkg.json`, depends on the use case) and put your name and contact information in contributors section. We would like to recognize the work and empower every contributor in creative ways :)

## Changelog

Changelog files are located in `/changelog` folder.
> See [CHANGELOG.md](https://github.com/MitocGroup/deep-framework/blob/master/CHANGELOG.md) for latest changelog.

## License

This repository can be used under the MIT license.
> See [LICENSE](https://github.com/MitocGroup/deep-framework/blob/master/LICENSE) for more details.

## Sponsors

This repository is being sponsored by:
> [Mitoc Group](http://www.mitocgroup.com)

## Appendix A: Diagrams

### Serverless Architecture

![Digital Enterprise End-to-end Platform aka DEEP](https://raw.githubusercontent.com/MitocGroup/deep-framework/master/docs/deep-architecture.png)

### DEEP Components

![Digital Enterprise End-to-end Platform aka DEEP](https://raw.githubusercontent.com/MitocGroup/deep-framework/master/docs/deep-ecosystem.png)
