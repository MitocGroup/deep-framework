# Unit testing setup


### 1. Fix package.json

Install globally packages below:

```js
"devDependencies": {
  "jspm": "^0.15.7",
},
```

### 2. Fix package.json

In /DeepMgYourServiceName/Frontend/js/package.json need to add to npm devDependencies:

```js
"devDependencies": {
  "jspm": "^0.15.7",
},
```

### 3. Install dependencies

From /DeepMgYourServiceName/Frontend/js/ folder need to run:

```sh
npm install
```

### 4. Create folders in for Backend and Frondend unit tests in /DeepMgYourServiceName/Tests/ folder: 

```sh
mkdir Frondend Backend
```

### 5. Karma configuration

Don’t add your styling inside of a tag or in the HEAD, use external .css files. Keeping your CSS files separate means that future pages can link to them and use the same code, so changing the design on multiple pages becomes easy.

Copy config.karma.js from (https://github.com/MitocGroup/deep-management/blob/dev/DeepMgProperty/Tests/Frontend/config.karma.js) to in /DeepMgYourServiceName/Tests/Frontend/ folder .  This karma configuration file defines which files should be uploaded, tested and so on; which plugins, preprocessors will be used; coverage report path, reports format, karma modes, debug level - please refer to the official docs for more details http://karma-runner.github.io/0.13/config/configuration-file.html .

> Note:  Karma is essentially a tool which spawns a web server that executes source code against test code for each of the browsers connected. 

Change line 34 in config.karma.js  
from:
 		 config: 'config.property.js',
to:
	   config: 'config.<yourServiceName>.js',

For example, 'config.auth.js', 'config.billing.js', 'config.core.js', ‘config.photo.js’.

### 6. Adding health checks

Copy folders from (https://github.com/MitocGroup/deep-management/tree/dev/DeepMgProperty/Tests/Frontend/angular) folder to /DeepMgYourServiceName/Tests/angular/ folder.

Here you can find some details about folders:

	controllers (empty folder) - files with unit tests for controllers
	directives (empty folder) - files with unit tests for directives
	filters (empty folder) - files with unit tests for filters
	health-checks  (non-empty file, please leave all tests in this file, we will use it to test if are karma+istambul+jasmine+angular installed correctly) -  file with health check tests 
	
### 7. Launch unit testing

To run test and enjoy please run from root folder: 

```sh
karma start DeepMgYourServiceName/Tests/Frontend/config.karma.js 
```

### 8. To get started with Travis CI

* Sign in to Travis CI with your GitHub account, accepting the GitHub access permissions confirmation.

* Once you’re signed in, and we’ve synchronized your repositories from GitHub, go to your profile page and enable Travis CI for the repository you want to build.

> Note: You can only enable Travis CI builds for repositories you have admin access to.

* Add a .travis.yml file to your repository to tell Travis CI what to build:


```sh
language: node_js
sudo: false
node_js:
- '0.11'
- '0.12'

branches:
  only:
  - master
  - stage
  - test
  - dev

before_install:
- npm install -g jspm
- if [ -f 'package.json' ]; then echo "package.json already exists"; else cp test/package.json . ; fi 
- test/bin/setup_npm.sh

# run codacy and coveralls to analyse code and send coverage reports to them 
after_success:
- npm run codacy
- npm run coveralls
```


### 9. FAQ
1. If you encounter the following:
```sh
GitHub rate limit reached. To increase the limit use GitHub authentication.
Run jspm endpoint config github to set this up.
``` 
Steps to fix:
1.1.  Go to https://github.com/settings/tokens

1.2.  Create a token , label it "Travis"

1.3.  Copy paste the token

1.4.  To support private GitHub, simply authenticate with your private GitHub account (You'll be asked for the token): 

    ```sh
    jspm registry config github
    ```

    ```sh
    Would you like to set up your GitHub credentials? [yes]: 
    If using two-factor authentication or to avoid using your password you can generate an access token at https://github.com/settings/applications.
    <br />
    Enter your GitHub username: username
    Enter your GitHub password or access token: 
    Would you like to test these credentials? [yes]:
    ```

    This will enable private repo installs.
   
1.5.  Run the ```jspm registry export``` command will export the list of commands needed to recreate exactly that registry through configuration calls to jspm:

    ```sh
    jspm config registries.github.remote https://github.jspm.io
    jspm config registries.github.auth JSPM_GITHUB_AUTH_TOKEN
    jspm config registries.github.maxRepoSize 100
    jspm config registries.github.handler jspm-github
    ```

    > JSPM_GITHUB_AUTH_TOKEN: unencrypted Base64 encoding of your GitHub username and password or access token
    
1.6. [Install travis-cli](https://github.com/travis-ci/travis.rb#installation)
    
    ```sh
    $ ruby -v
    ruby 2.0.0p481 (2014-05-08 revision 45883) [universal.x86_64-darwin14]
    ```
    
    ```sh
    $ gem install travis -v 1.8.0 --no-rdoc --no-ri
    ```
    
    ```sh
    $ travis version
    1.8.0
    ```
    
1.7.  Go to the root of your repo, encrypt the token your ```JSPM_GITHUB_AUTH_TOKEN ```
    
    ```sh
    travis encrypt 'JSPM_GITHUB_AUTH_TOKEN=[JSPM_GITHUB_AUTH_TOKEN]'
    ```
    outputs your ```ENCRYPTED_STRING```
    
1.8.  Include in your ```.travis.yml```
    
    env:
      global:
      - secure: [ENCRYPTED_STRING]
    
    before_install:
    - npm install -g jspm
    - jspm config registries.github.auth $JSPM_GITHUB_AUTH_TOKEN
    
1.9.  Optional
    
    ```sh
    nano ~/.jspm/config
    ```
    
    remove the ```registries.github``` part so that the token will only be used by Travis (not by you).

2. How to init karma?


2.1. Steps to do:
Run `karma init config.karma.js` in your `${MICROSERVICE}/Tests/Frontend` path:

```sh
Which testing framework do you want to use ? `jasmine`
Do you want to use Require.js ? `no`
Do you want to capture any browsers automatically ? `PhantomJS`
What is the location of your source and test files ? `Tests/Frontend/angular/**/*.spec.js`
Should any of the files included by the previous patterns be excluded ? ` `
Do you want Karma to watch all the files and run the tests on change ? `no`
```

3. How to make troubleshooting?

3.1. Steps to check if ```Babel can not call Class as Function```

```
Cannot call a class as a function at _classCallCheck ...
```
**Solution:** Rewrite all classes provided to angular as function from:

```
class MyService{};

angular.module(MODULE_NAME).service('MyService', MyService);
```
to

```
class MyService{};

angular.module(MODULE_NAME).service('MyService', [function() {
	return new MyService();
}]);
```

3.1. Steps to check if ```Dependencies do not get injected```

```
Failed to instantiate module ${module name} due to:
TypeError: 'undefined' is not an object 
```
**Solution** Use inline array annotations instead of $inject Property Annotation

```
class MyService{
	constructor(dependency) {}
};

MyService.$inject = ['dependency'];

angular.module(MODULE_NAME).service('MyService', ['dependency', function(dependency) {
	return new MyService(dependency);
}]);
```

change to 

```
class MyService{
	constructor(dependency) {}
};

angular.module(MODULE_NAME).service('MyService', ['dependency', function(dependency) {
	return new MyService(dependency);
}]);
```