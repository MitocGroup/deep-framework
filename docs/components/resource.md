deep-resource
=============

Examples
--------

```javascript
let app = DeepFramework.Kernel;
let resource = app.get('resource');

// list all resources from all microservices
console.log(resource.list);

// accessing one resource
let userResource = resource.get('@deep.microservices.helloworld:user');

// listing resource actions
console.log(userResource.actions);

// accessing one action
if (userResource.has('retrieve')) {
    let retrieveUserAction = userResource.action('retrieve');
}

// making a request from resource object
let payload = {
    id: '<user_id>'
}

userResource.request('retrieve', payload, 'GET').send(function(response) {
    if (response.isError) {
        throw new Error(response.error);
    } else {
        console.log(response.data);
    }
});

// making a request from action object
retrieveUserAction.request(payload, 'GET').send(function(response) {
    if (response.isError) {
        throw new Error(response.error);
    } else {
        console.log(response.data);
    }
});

// let's cache it for a minute (Note: by default each request is cached for 10 seconds!)
let retrieveUserRequest = userResource.request('retrieve', payload);

retrieveUserRequest.cache(60).send(function(response) {
    if (response.isError) {
        throw new Error(response.error);
    } else {
        console.log(response.data);
    }
});

// predefined cache values:
retrieveUserRequest.cache(-1) // invalidate cache
retrieveUserRequest.cache(0) // cache forever

// You can disable cache for a request
retrieveUserRequest.disableCache()

// ...or invalidate the stored cache (if available)
retrieveUserRequest.invalidateCache()
```
