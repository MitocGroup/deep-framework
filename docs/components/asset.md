deep-asset
==========

Examples
--------

```javascript
let app = DeepFramework.Kernel;
let deepAsset = app.get('asset');

let iconPath = deepAsset.bind(microserviceObject).locate('images/icon.png');

// short syntax
let iconPath = deepAsset.locate('@microservice_identifier:images/icon.png');
```
