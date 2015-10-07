DEEP
====

This Platform-as-a-Service consists from [DEEP Framework](https://www.npmjs.com/package/deep-framework) at lower level and [DEEP Microservices](https://github.com/MitocGroup/deep-microservices-todo-app) on higher level.

The Anatomy
-----------

[DEEP Framework](https://www.npmjs.com/package/deep-framework) is the base of every microservice
and gives the developers the opportunity to reduce the learning curve of AWS services and infrastructure
and make possible pushing code from the very first day. It helps to avoid calling AWS resources
directly rather than using a developer friendly environment and tools to achieve highest performance 
and lower cost of the development process and results into a fast, reliable and successful application.

[DEEP Microservices](https://github.com/MitocGroup/deep-microservices-todo-app) is the minimal functional 
codebase which consists each web app that contains a couple of backend resources and a frontend on top of it.

Quick start
-----------

- Open terminal (console)
- Install `git` and `nodejs`
- Execute `npm install deepify -g` in order to setup [DEEP Development Tools](tools.md)
- Execute `deepify helloworld path/to/web_app` to dump the basic `Hello World` example
- Execute `deepify server path/to/web_app -o` to run your web app locally
- Execute `deepify deploy path/to/web_app` to run your web app on AWS

Security
--------

Security is one of the most important things to take into consideration when working on AWS.
Follow the [step by step guide](security/secure-aws-credentials.md) of creating secured AWS 
credentials to be used with `DEEP`.

Links
-----

- [Deep Framework](framework.md)
- [Deep Microservice](microservice.md)
- [Deep Tools](tools.md)
