Environment variables to be used with `deepify`
===============================================

There are some environment variables (`export xxx=yyy;`) available in `deepify`
and `deep-package-manager`.

- `export DEEP_SKIP_DEPLOY_ID_INJECT=1` to skip deployment ID variable injection into the assets (except the `deep-asset` functionality)
- `export DEEP_NO_INTERACTION=1` to disable interactive user interaction like prompts in terminal (an default value is always chosen)
- `export DEEP_SKIP_ASSETS_OPTIMIZATION=1` to skip assets optimization (`gzip`'ing assets) while building the frontend
- `export DEEP_DUMP_RESOLVED_DEPS_TREE=1` to dump dependencies tree on `compile-prod` after resolving it
- `export DEEP_LOG_LEVEL=error|warn|info|debug|silent` to switch between log levels

> Use these variables carefully!
> There should always be safer options that change behavior just like the variables do.
