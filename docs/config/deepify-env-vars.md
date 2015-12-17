Environment variables to be used with `deepify`
===============================================

There are some environment variables (`export xxx=yyy;`) available in `deepify`
and `deep-package-manager`.

    - `DEEP_SKIP_DEPLOY_ID_INJECT` to skip deployment ID variable injection into the assets (except the `deep-asset` functionality)
    - `DEEP_NO_INTERACTION` to disable interactive user interaction like prompts in terminal (an default value is always chosen).
    

> Use these variables carefully! 
> There should always be safer options that change behavior just like the variables do.