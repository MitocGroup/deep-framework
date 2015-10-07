Deepify
=======

Deepify is a `npm publish` alike tool that helps developer publish his microservices
from local machine to remote repository (S3). Also it is used by `deep-package-manager` to publish and pull microservices dependencies.

> To be able to use 'deepify pull' command you have to install globally `deep-package-manager` module

Instead of providing configuration parameter inline (from command line directly) an `deeploy.json`
configuration file is used. The `deeploy.json` file must be located in bundle root directory.

> `deepify pull` command is used to resolve dependencies in a application

Usage
-----

> `deepify publish tests/pm/sample_bundle --dry-run` is used to push microservices within the whole bundle
> `deepify publish tests/pm/sample_bundle:HelloWorld,some-other-microservice-dir` is used to push certain microservices

Important: `deepify pull` and `deepify publish` commands does have the same syntax

> `--dry-run` option is used to skip uploading dependencies to remote repository

Example of `deeploy.json`
-------------------------

[See deeploy docs](deeploy.md#example-of-deeployjson)

> If Repository S3 bucket (ex. `deep.deps.repository`) is missing while trying to publish microservices- an exception is thrown!
