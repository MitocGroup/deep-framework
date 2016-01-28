deep-validation
==============

Examples
--------

```javascript
let app = DeepFramework.Kernel;
let validation = app.get('validation');

// Check if we have the 'User' validation schema registered
if (!validation.hasSchema('User')) {

    // Register a schema object (in fact a Joi validation object)
    // @see [Validation Schema Anatomy](validation.md#validation-schema-anatomy)
    validation.setSchema('User', joiSchemaObject);
    
    // Register a raw schema object
    // @see [Models Anatomy](validation.md#models-anatomy)
    //validation.setSchemaRaw('User', modelAlikeSchemaObject);
}

// Validating input data
let validatedUserObject = validation.validate('User', {/* your input data */});

// How to use it in your backend handler
handle(request) {
  
  // Validate Lambda input using model 'User' validation schema
  // When the validation fails an error response is sent back automatically
  this.validateInput('User', (modelData) => {
  
    // Get deep-db model 'User'
    let model = this.kernel.get('db').model('User');
    
    // Persist a new 'User' item
    model.create(modelData, function (error, user) {
      // ...
    });
  });
}

// ... or even define a schema name/object in your handler
class Handler {

 handle(modelData) {
 
  // get deep-db model 'User'
  let model = this.kernel.get('db').model('User');
  
  // Persist a new 'User' item
  model.create(modelData, function (error, user) {
    // ...
  });
 }
 
 // This is the method the validation schema is read from
 // It overwrites the default getter from Runtime
 get validationSchema() {
  return 'User';
  
  // ... or a Joi object
  // return Joi.object().keys({...});
  
  // ... or a model like object
  // return {'FirstName': 'string', 'LastName': 'string'};
  
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

module.exports = function(Joi) {
	return Joi.object().keys({
		Name: Joi.string().alphanum().min(2).max(255).required()
	});
};
```

> You should `export default` any values allowed by the `get validationSchema()` getter in your handler
