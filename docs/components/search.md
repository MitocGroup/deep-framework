deep-search
===========

Examples
--------

```javascript
let deepSearch = DeepFramework.Kernel.get('search');
let esClient = null;

deepSearch.getClient("<client_name>", (error, client) => {
  if (error) {
    // @note - check for NotReadySearchDomainException and retry getting the client 
    // because search domain url is available in ~15min after creating it 
  
    console.log(error);
  } else {
    esClient = client;
  }
});
```

client - is an instance of [elasticsearch.js](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html) client

client_name - is the name of one of the clusters created on provisioning application (e.g. `rum`)