deep-validation
==============

Examples
--------

```javascript
let app = DeepFramework.Kernel;
let validation = app.get('validation');

if (validation.hasSchema('User')) {
    let model = validation.getSchema('User');
}

validation.setSchema('User1', joiSchemaObject); // Joi object
validation.setSchemaRaw('User2', modelAlikeSchemaObject);

let validatedUserObject = validation.validate('User1', {...});

// how to use it in your backend handler
handle(request) {
  
  // validate Lambda input using model 'Name' validation schema
  this.validateInput('Name', (modelData) => {
  
    // get deep-db model 'Name'
    let model = this.kernel.get('db').model('Name');
    
    // Persist a new 'Name' item
    model.create(modelData, function (err, user) {
      // ...
    });
  });
}

// ... or even define a schema name in your handler
class Handler {

 handle(modelData) {
 
  // get deep-db model 'Name'
  let model = this.kernel.get('db').model('Name');
  
  // Persist a new 'Name' item
  model.create(modelData, function (err, user) {
    // ...
  });
 }
 
 get validationSchema() {
  return 'Name';
  
  // ... or a Joi object
  // return Joi.object().keys({...});
  
  // ... or a model like object
  // return {'Name': 'string'};
  
  // ... or even a callback that returns both Joi or a mode like object
  // return (Joi) => {
  //  return Joi.object().keys({...});
  //};
 }
}

// If validation fails you'll get an error response created
// @see https://github.com/hapijs/joi/blob/v7.2.2/API.md#errors
{
  errorType: error.name,  // 'ValidationError'
  errorMessage: error.annotate(), // A string with an annotated version of the object pointing at the places where errors occurred
  errorStack: error.stack || (new Error(error.message)).stack,
  validationErrors: error.details, // An array of errors (`{message,path,type,context}`)
}
```

> `deep-db` models are loaded from `deep-validation`

> [Vogels](https://github.com/ryanfitz/vogels) types are built in

Models Anatomy
--------------

Here's a sample model validation schema:

```json
{
  "FirstName": "string",
  "LastName": "string",
  "Email": "string",
  "Age": "number",
  "Phones": {
    "Work": "string",
    "Mobile": "string"
  },
  "Location": {
    "Country": "string",
    "City": "string",
    "Address": "string",
    "Zip": "string"
  }
}
```

> Field types are strings mapped internally to [Joi](https://github.com/hapijs/joi) validation schemas.

The following types are supported:

- uuid
- timeUUID (mainly used as unique identifier)
- stringSet
- numberSet
- binarySet
- binary
- number
- string
- boolean
- email
- website


Validation Schema Anatomy
-----------------------

Here's a sample validation schema:

```js
'use strict';

export default (Joi) => {
	return Joi.object().keys({
		Name: Joi.string().alphanum().min(2).max(255).required()
	});
};
```

> You should `export default` any values allowed by the `get validationSchema()` getter in your handler