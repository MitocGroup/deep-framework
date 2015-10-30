deep-framework
=============

Main modules:
-----------

- [deep-asset](components/asset.md) (Managing and accessing assets)
- [deep-cache](components/cache.md) (Cache management)
- [deep-core](components/core.md) (Core features and base functionality)
- [deep-validation](components/validation.md) (Validation engine widely used in framework)
- [deep-db](components/db.md) (Database abstraction layer based on Active Record pattern)
- [deep-di](components/di.md) (Dependency Injection)
- [deep-event](components/event.md) (Cross runtime event system)
- [deep-fs](components/fs.md) (File system abstraction layer that mimics NodeJS js fs base module)
- [deep-kernel](components/kernel.md) (Kernel module that combines all the beans together)
- [deep-log](components/logs.md) (Logging components)
- [deep-notification](components/notification.md) (Broadcasting notifications to the end user)
- [deep-resource](components/resource.md) (Resources management and invocation)
- [deep-security](components/security.md) (Managing and injecting user context into the runtime)

The deep-framework Anatomy
-------------------------

Each DEEP framework module except the basis (`deep-core`) uses `deep-kernel` and `deep-di`.

`deep-kernel` enforces each module to extend a `Kernel.ContainerAware` abstract class
that is loaded in runtime into a service.

> `deep-kernel` transforms each module into a service (ex. `deep-db` as `db`, `deep-log` as `logs` etc.)

`Kernel.ContainerAware` makes possible you to bind a microservice instance using `.bind(microserviceObject)` method.

> Be aware- a service action that requires a `microservice` would throw an error if it is missing

Initializing and using the app
------------------------------

```javascript
import deep-framework from 'deep-framework';

let app = DeepFramework.Kernel;

app.loadFromFile("_config.json", function() {
    // your application was initialized
    
    let fs = app.container.get('fs'); // deep-fs service
    let asset = app.get('asset'); // deep-asset service
    
    let helloWorldMicroservice = app.microservice('deep.microservices.helloworld'); // microservice instance
    let currentMicroservice = app.microservice(); // current microservice instance
    
    let iconPath = asset.locate('@deep.microservices.helloworld:images/icon.png');
});
```

> Note that mainly all the services implements `path resolving feature`: `'@xxxx:yyyy'` where `xxxx` is the
> microservice identifier and `yyyy` is some service specific descriptor
