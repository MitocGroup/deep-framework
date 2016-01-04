Deep development server
=======================

The command start a local server on `http://localhost:{port}/` and serves the files
without building the application (in runtime).

> Lambda calls are proxied locally and runs lambda in the same manner the AWS does.

Example usage
-------------

Run in terminal: 

```bash
~#: deepify server path/to/sample_application --build-path="path/to/sample_application/build" --port="8888" --open-browser --skip-aws-sdk --profiling
```

> The option `--open-browser` <del>currently works only on MacOS</del> open the application default browser when the server is ready

> The option `--build-path` is used to load both frontend and backend configs 
> in order to get backend working with AWS on the local server (this is simulated by default)

> The option `--profiling` enables Lambdas profiling (with integrated UI)

> The option `--db-server` specifies the local DynamoDB server implementation (LocalDynamo, Dynalite)

Available hooks
---------------

The list of available hooks:
 
 - [Initialize](hooks/on-init.md)
 - [On Before/After Start](hooks/server.md)