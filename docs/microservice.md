DEEP Microservice
=================

Structure
---------

- `DeepHelloWorld`/
    - `Frontend`/ # @see [structure](structure/frontend.md)
        - `.deepignore` # @see [docs](config/.deepignore.md)
        - `.deepinjectignore` # @see [docs](config/.deepinjectignore.md)
        - `_build` # If exists, DEEP uses this folder by default and ignores everything else in `Frontend`
        - `bootstrap.js` # **required**
        - `index.html` # **required** for root microservice
        - `css`/
        - `js`/
        - `images`/
        - ...
    - `Backend`/ 
        - `resources.json` # **required**
        - `src`/
            - `SayHello`/
                - `package.json` # **required**
                - `bootstrap.js` # **required**
                - `Handler.js`
                - ...
    - `Data`/
        - `Models`/
            - `User.json` # @see [structure](components/validation.md#models-anatomy)
            - `Property.json` # ...
            - ...
        - `Validation`/ 
            - `SampleUser.js` # @see [structure](components/validation.md#validation-schema-anatomy)
            - ...
        - `Fixtures`/ # TBD
            - ...
        - `Migration`/ # TBD
            - ... 
    - `Docs`/
        - `index.md`
        - ...
    - `Tests`/ # @see [structure](test/unit_testing.md)
        - Backend
        - Frontend
        - ...
    - `deepkg.json` # **required**
    - `parameters.json`

Configuration file (`deepkg.json`)
----------------------------------

```javascript
{
  "identifier": "deep.microservices.helloworld", // Unique across the DEEP, used to retrieve certain microservices in framework and system wise
  "name": "HelloWorld", // Non unique, human readable microservice name
  "description": "Say hello to the world...", // Optional microservice description
  "version": "0.0.1", // Microservice version compatible with semantical versioning syntax (same as NPM)
  "propertyRoot": true, // Flag that indicates that microservice is treated a a root one (must contain an `Frontend/index.html` file)
  "author": { // The list of authors
    "name": "Mitoc Group",
    "email": "hello@mitocgroup.com",
    "website": "www.mitocgroup.com"
  },
  "contributors": [ // The list of contributors
    {
      "name": "DEEP Dev Team",
      "email": "hello@deep.mg",
      "website": "www.deep.mg"
    }
  ],
  "tags": [
    "DEEP", "sample"
  ],
  "frontendEngine": ["angular"], // The engine used in frontend. Optional, default ["angular"]
  "dependencies": { // A list of other microservices that the current one depends on
    "deep.microservices.helloworld": "~1.0.*"
  },
  "autoload": { // Optional override path of the microservice components
    "frontend": "Frontend/",
    "backend": "Backend/",
    "docs": "Docs/",
    "models": "Data/Models/", // Database models directory
    "validation": "Data/Validation/", // Validation schemas
    "fixtures": "Data/Fixtures/", // Fixtures (`TBD`!)
    "migration": "Data/Migration/", // Database Migrations (`TBD`!)
  }
}
```

Resources file (`resources.json`)
---------------------------------

> Be aware that `resource` and `action` names have to be LOWERCASE (use dashes for delimiting things)!

```javascript
{
    "user": {
        "retrieve": {
            "description": "Retrieves a user", // description of the functionality
            "type": "lambda", // resource type (supported: `lambda`, `external`)
            "methods": ["GET"], // supported HTTP methods
            "cacheTtl": -1, // cache TTL in seconds applied to "GET" method only (default -1 means no cache, 0 cache permanently, 1...*). On the lowest level caching is managed by AWS ApiGateway.
            "source": "src/User/Retrieve", // the source of the resource (ex. for external type: http://example.com/api/v1/users)
            "force-user-identity": true, // assure the user info is available in lambda
            "validationSchema": "Sample", // specify validation schema name (@see `deep-validation`) used to both validate payload and backend input data
            "engine": { // only available for `"type": "lambda"`
                "memory": 512, // max. amount of RAM allocated to a lambda (default 128, max. 1536) 
                "timeout": 30, // timeout Lambda runs within, (max. 5 minutes)
                "runtime": "nodejs" // Lambda runtime engine (default nodejs)
            }
        },
        "other-action": {
            ...
        }
    },
    "other-resource": {
        "other-action": {
            ...
        }
    }
}
```

> Note that only `nodejs` Lambda runtime is currently supported by the dev server

Custom parameters (`parameters.json`)
-------------------------------------

```javascript
{
    "frontend": { // shared in frontend only
        "key1": {
          "type": "string",
          "required": "false"
        },
        ...
    },
    "backend": { // shared in backend only
        "key1": {
          "type": "string",
          "required": "false"
        },
        ...
    }
}

```

> Note that `root` microservice can contain a `globals` section shared with both frontend and backend

[Read More](https://github.com/raml-org/raml-spec/blob/master/raml-0.8.md#named-parameters) about RAML parameters...

Example of `globals` section
----------------------------

```javascript
{
    "globals": {
        "userProviderEndpoint": {
          "displayName": "User Provider Endpoint",
          "type": "string",
          "required": true,
          "pattern": "^@[^:]+:.+$",
          "example": "@deep.auth:user-retrieve",
          "default": "@deep.auth:user-retrieve"
        },
        ...
    },
    "frontend": ...
    "backend": ...
}
```
