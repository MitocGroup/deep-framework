deep-search
===========

Examples
--------

NOTE. Before accessing search client please make sure you have enabled search in your app (@see [parameters.json](https://github.com/MitocGroup/deep-microservices-root-angular/blob/master/src/DeepRootAngular/parameters.json#L49) file)

```javascript
let deepSearch = DeepFramework.Kernel.get('search');
let esClient = null;

deepSearch.getClient((error, client) => {
  if (error) {
    // @note - check for NotReadySearchDomainException and retry getting the client 
    // because search domain url is available in ~15min after creating it 
  
    console.log(error);
  } else {
    esClient = client;
  }
});
```

`client` - is an instance of [elasticsearch.js](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html) client

Thrown Exceptions
-----------------
`UnknownSearchDomainException` - Thrown when deepSearch.getClient("<domain_name>", cb) is invoked with invalid search domain name
`NotReadySearchDomainException` - Thrown when search domain url is not yet ready (It's available in ~15min after app is deployed)
`MissingSearchClientException` - Thrown when Client implementation is missing for specific domain type (e.g. ElasticSearch or CloudSearch)
