Deep Property CRUD
==================

Deep installs a application using native package manager in a same way `DeepPlatform` does internally.

> To be able to use `deepify deploy` command you have to install globally `deep-package-manager` module

Instead of providing configuration parameter inline (from command line directly) an `deeploy.json`
configuration file is used. The `deeploy.json` file must be located in bundle root directory.

> After creating application environment `deepify deploy` command saves internal 
> config in `.{hash}.{env}.provisioning.json` file from the application root

Example:

```bash
~#: deepify deploy tests/pm/sample_application --dump-local="tests/pm/sample_application_" --dry-run
```

Example of `deeploy.json`
------------------------

```js
{
  "env": "dev",
  "domain": "example.com", // Read when running `deepify enable-ssl path/to/web_app`
  "awsAccountId": 999999999999,
  "appIdentifier": "deep_platform_dev",
  "aws": { // native AWS config injected into aws-sdk library
    "accessKeyId": "<aws_access_key_id>",
    "secretAccessKey": "<aws_secret_access_key>",
    "region": "us-east-1",
    "httpOptions": {
      "timeout": 30000
    }
  }
}
```

> `dependencies` is optional and needed mainly when working with different devs that makes changes to other microservices
> and test that separately (npm repository alike)

> `aws` application from the `deeploy.json` root is the native `aws-sdk` configuration object 
(refer to [AWS docs](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html)).

> `appIdentifier` should be unique per application!

Available hooks
---------------

The list of available hooks:
 
 - [Initialize](hooks/on-init.md)
 - [Post Deploy](hooks/post-deploy.md)