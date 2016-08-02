DEEP Framework 
==============

[![NPM Version](https://img.shields.io/npm/v/deep-framework.svg)](https://npmjs.org/package/deep-framework)
[![Build Status](https://travis-ci.org/MitocGroup/deep-framework.svg?branch=master)](https://travis-ci.org/MitocGroup/deep-framework)
[![Test Coverage](https://codeclimate.com/repos/5789fd557fb65e007000637d/badges/16a77803c68c6316f95b/coverage.svg)](https://codeclimate.com/repos/5789fd557fb65e007000637d/coverage)
[![API Docs](http://docs.deep.mg/badge.svg)](http://docs.deep.mg)

DEEP Framework is a Full-Stack JavaScript Framework for building cloud-native web applications.

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

Documentation is available as [Developer Guide](https://github.com/MitocGroup/deep-framework/blob/master/docs/framework.md)
and [API Guide](http://docs.deep.mg).

Learn hands-on how to build and deploy cloud-native web applications from
[this blog post](https://blog.mitocgroup.com/building-enterprise-level-web-applications-on-aws-lambda-with-the-deep-framework-dd81719b0dff)
and [this tutorial video](https://www.youtube.com/playlist?list=PLPGfD-tGOl7uNDXo_eMN1odMZflYVu2n9).


## Getting Started

### Step 1. Pre-requisites

- [x] [Create an Amazon Web Services account](https://www.youtube.com/watch?v=WviHsoz8yHk)
- [x] [Configure AWS Command Line Interface](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)
- [x] [Get Started - Installing Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [x] [JDK 8 and JRE 8 Installation Start Here](https://docs.oracle.com/javase/8/docs/technotes/guides/install/install_overview.html)
- [x] [Install nvm](https://github.com/creationix/nvm#install-script) and [use node v4.3+](https://github.com/creationix/nvm#usage)
- [ ] Install DEEP CLI, also known as `deepify`:

```bash
npm install deepify -g
```

> If you want to use `deepify` on Windows, please follow the steps from
[Windows Configuration](https://github.com/MitocGroup/deep-framework/blob/master/docs/windows.md)
before running `npm install deepify -g` and make sure all `npm` and `deepify` commands are executed
inside Git Bash.

### Step 2. Install Microservice(s) Locally

```bash
deepify install github://MitocGroup/deep-microservices-helloworld ~/deep-microservices-helloworld
```

> Path parameter in all `deepify` commands is optional and if not specified, assumes current
working directory. Therefore you can skip `~/deep-microservices-helloworld` by executing
`mkdir ~/deep-microservices-helloworld && cd ~/deep-microservices-helloworld` before `deepify install`.

### Step 3. Run Microservice(s) in Development

```bash
deepify server ~/deep-microservices-helloworld -o
```

> When this step is finished, you can open in your browser the link *http://localhost:8000*
and enjoy the deep-microservices-helloworld running locally.

### Step 4. Deploy Microservice(s) to Production

```bash
deepify deploy ~/deep-microservices-helloworld
```

> Amazon CloudFront distribution takes up to 20 minutes to provision, therefore don’t worry
if it returns an HTTP error in the first couple of minutes.

### Step 5. Remove Microservice(s) from Production

```bash
deepify undeploy ~/deep-microservices-helloworld
```

> Amazon CloudFront distribution takes up to 20 minutes to unprovision. That's why `deepify`
command checks every 30 seconds if it's disabled and when successful, removes it from your account.


## Developer Resources

Having questions related to deep-framework?

- Ask questions: https://stackoverflow.com/questions/tagged/deep-framework
- Chat with us: https://gitter.im/MitocGroup/deep-framework
- Send an email: feedback@deep.mg

Interested in contributing to deep-framework?

- Contributing: https://github.com/MitocGroup/deep-framework/blob/master/CONTRIBUTING.md
- Issue tracker: https://github.com/MitocGroup/deep-framework/issues
- Releases: https://github.com/MitocGroup/deep-framework/releases
- Roadmap: https://github.com/MitocGroup/deep-framework/blob/master/ROADMAP.md

Looking for web applications that use (or are similar to) deep-framework?

- Hello World: https://hello.deep.mg | https://github.com/MitocGroup/deep-microservices-helloworld
- Todo App: https://todo.deep.mg | https://github.com/MitocGroup/deep-microservices-todo-app
- Enterprise Software Marketplace: https://www.deep.mg


## Sponsors

This repository is being sponsored by:
- [Mitoc Group](https://www.mitocgroup.com)
- [DEEP Marketplace](https://www.deep.mg)

This code can be used under MIT license:
> See [LICENSE](https://github.com/MitocGroup/deep-framework/blob/master/LICENSE) for more details.
