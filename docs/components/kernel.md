deep-kernel
==========

Examples
--------

```javascript
let app = DeepFramework.Kernel;

let currentMicroservice = app.microservice();
let someMicroservice = app.microservice('someOther.microservice.identifier');

console.log(app.microservices); // list available microservices
console.log(app.services); // loaded core services prototypes

let di = app.container;

if (di.get('service1') === app.get('service1')) {
    console.log('Kernel proxies get method to container');
}

if (app.isFrontend) {
    console.log('deep-framework runs in browser');
} else if(app.isBackend) {
    console.log('deep-framework runs in nodejs');
}
```