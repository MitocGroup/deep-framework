Frontend Structure
==================


Structure
---------

- `Frontend`/
    - `bootstrap.js` (required by DEEP)
    - `index.html` (required by DEEP for an root microservice only)
    - `fonts`/
    - `img`/
    - `stylesheets`/
    - `sass`/
    - `js`/
        - `package.json` (required by JSPM)
        - `config.{functionality}.js` (used by JSPM, ex. `config.property.js`)
        - `app`/
            - `angular`/ (library specific application)
                - `controllers`/
                - `directives`/
                - `filters`/
                - `module`/
                - `services`/
                - `views`/
                - `index.js` (mandatory in old app)
                - `name.js` (mandatory in old app)
        - `lib`/ (for non JSPM dependencies)
        - `vendor`/ (created by JSPM using package.json config)


How to set up JSPM
------------------

1. Save your `dependencies` from your old `package.json`.
2. Create file `package.json` and insert the text below and change it corresponding to your microservice. 
    ```javascript
    {
      "name": "DeepMg{functionality}", //exanple DeepMgBilling, DeepMgCore
      "version": "0.0.0",
      "description": "DEEP Micro Services {functionality}", //exanple Billing, Core
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "build": "npm run build:styles && npm run build:modules",
        "build:modules": "jspm bundle js/app/angular/index lib/modules_bundle.min.js --minify --skip-source-maps --inject",
        "build:modules:sfx": "jspm bundle-sfx app/angular/index lib/modules_bundle.sfx.min.js --minify",
        "build:styles": "sass --scss ../sass/main.scss ../stylesheets/main.min.css -E 'UTF-8'"
      },
      "jspm": {
        "directories": {
          "baseURL": "..",
          "lib": "",
          "ss": "",
          "packages": "vendor"
        },
        "configFile": "config.{functionality}.js", // ex. config.billing.js, config.core.js
        "dependencies": {
          // Your dependencies goes here
        },
        "devDependencies": {
          "traceur": "github:jmcriffey/bower-traceur@0.0.88",
          "traceur-runtime": "github:jmcriffey/bower-traceur-runtime@0.0.88"
        }
      }
    }
    
    ```
3. In the terminal type `~#: cd {project_root}/{microservice}/Frontend/js` and than `~#: jspm init && jspm install`.

Setup img and fonts directories (if you are using `WebStorm`)
-----------------------------------------------------------

1. Move all your `*.sass` files in `sass/` directory.
2. Right click on `sass/` directory and select `Replace in path...`.
3. Write in Text to find: `assets/img` and in Replace with `img` and hit find, in pop up window click `All Files`.
4. Right click on `sass/` directory and select `Replace in path...`.
5. Write in Text to find: `assets/fonts` and in Replace with `fonts` and hit find, in pop up window click `All Files`.

Angular application naming convention
--------------------------------------

Because of possible conficts with third-party microservices, while creating angular application, you should follow this name standard: `{microservice_name or microservice_identifier}{component_name}`

Examples:
- controller - `DeepAuthSignInController` 
- service - `DeepAuthMsAuthentication`
- filter - `deepAuthNumberWithWords`
- route name - `deep.auth.signin`
- directive - `deepAuthProfilePopup`
- module name - `deep.auth`
