deep-validation
==============

Examples
--------

```javascript
let app = DeepFramework.Kernel;
let validation = app.get('validation');

console.log(validation.models);

if (validation.has('User')) {
    let model = validation.get('User');
}

validation.set('User1', joiSchemaObject);
validation.setRaw('User2', modelAlikeSchemaObject);

let validatedUserObject = validation.validate('User1', {...});
```

> `deep-db` models are loaded from `deep-validation`

> [Vogels](https://github.com/ryanfitz/vogels) types are built in

Models Anatomy
--------------

Here's a sample model:

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