deep-di
======

DI is the core module used by other components

Examples
--------

```javascript
let app = DeepFramework.Kernel;
let di = app.container;

di.addParameter('param1', 'Some value');
di.addService('service1', SomeUserDefinedObject);

di.register('service1', SomeServiceClass, ['param1', 'service1']);

let service1 = di.get('service1');
```