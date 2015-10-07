DEEP Development Tools
======================

Tools set is indeed to help developers to focus on the code and not on infrastructure management.

Entry point of each command is the executable `deepify` (ex. `deepify deploy`, `deepify undeploy`).

> Type `deepify --help` in order to get some info.

> `deepify --version` or `deepify [command] --version` will print out the current wrapper/command version

Running Lambda locally
----------------------

In order to test lambdas before deploying them you are able to use lambda binary.

```bash
~#: deepify lambda tests/lambda/handler_hello.js --event='{"name":"Developer"}'
```

For more details read [documentation](tools/lambda.md)

Running development server
--------------------------

To start local development server you have to run

```bash
~#: deepify server path/to/web_app
```

For more details read [documentation](tools/server.md)

Creating/Updating web apps on local machine
-------------------------------------------

In order to publish microservices from local machine use `deepify deploy` command. 

```bash
~#: deepify deploy path/to/web_app
```

> Note that the command would look for an internal config to update an web app

For more details read [documentation](tools/deploy.md)

Dump the "Hello World" web app
------------------------------

In order to dump the "Hello World" sample web app into `path/to/web_app` run the following command: 

```bash
~#: deepify helloworld path/to/web_app
```

For more details read [documentation](tools/helloworld.md)

Remove provisioning and uploaded data
-------------------------------------

In order to remove provision created for `path/to/web_app` run the following command: 

```bash
~#: deepify undeploy path/to/web_app
```

For more details read [documentation](tools/undeploy.md)

Dependencies management locally
-------------------------------

In order to push microservices from local machine use `deepify push-deps` command,
as well as to pull - use `deepify pull-deps` command. Dependencies are uploaded to
or downloaded from specified S3 bucket.

```bash
~#: deepify push-deps path/to/web_app
```

```bash
~#: deepify pull-deps path/to/web_app
```

For more details read [documentation](tools/deps.md)