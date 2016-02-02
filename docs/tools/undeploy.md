Deep Unprovision
================

```bash
~#: deepify undeploy path/to/sample_application [--dirty]
```

> `--dirty` have to added to remove ALL the things from the account if no `.{hash}.{env}.provisioning.json` found. 
> This is an unrecoverable process!

Available hooks
---------------

The list of available hooks:
 
 - [Initialize](hooks/on-init.md)