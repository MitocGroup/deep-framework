Setup your deepify github access token
======================================

`deepify install` command uses be default anonymous github credentials.
If you want to setup your github access token in order to install private github microservices and have a higher github API rate limit,
please use this command:

```sh
$ deepify registry config github --set "<git_user>:<github_access_token>"
```

> Creating an access token for command-line use: https://help.github.com/articles/creating-an-access-token-for-command-line-use/
