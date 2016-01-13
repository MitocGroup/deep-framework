deep-search
=========

Using `search.json` config file specified in a microservice `DEEP` enables searching
through the data. You can use this component for autocomplete as well.

Configuration file (`search.json`)
----------------------------

For the following model

```javascript
{
  "Name": "string"
}
```

Configuration should look like this

```javascript
{
	"Name": { // Domain name should match the model name
		"timestamp": true, // Create indexes for createdAt/updatedAt fields
		"indexes": {
			"Name": { // Index name should match the model field name
				"type": "text", // Index type (int | double | literal | text | date | latlon | int-array | double-array | literal-array | text-array | date-array)
				"options": { // Optional options depending on the type declared (@see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudSearch.html#defineIndexField-property)
				    // @see params.IndexField.xxxOptions
				},
				"autocomplete": { // Enable autocomplete feature for this index
					"fuzziness": "low" // Suggestion match fuzziness level, default 'none' (none | low | high)
				}
			}
		}
	}
}
```

Examples
--------

```javascript
let app = DeepFramework.Kernel;
let db = app.get('search');

if (app.hasDomain('Name')) {
   let domain = app.domain('Name');
   
   // Using autocomplete
   
   let autocomplete = domain.autocomplete('Name');
   
   autocomplete.suggest('Jo', (response) => {
      if (response.error) {
        console.error(response.isError);
        return;
      }
      
      console.log('Execution time (ms):', response.executionTime);
      console.log('Total matches:', response.totalMatched);
      
      response.suggestions.forEach((suggestion) => {
        console.log('Matched with score', suggestion.score, ':', suggestion.suggestion);
      });
   });
   
   // Querying an domain
   
   let qb = domain.createQueryBuilder();
   
   qb
    .query('John')
    .queryOptions((queryOptions) => {
      queryOptions.field('Name');
    })
    .size(10)
    .sortBy('createdAt', 'desc')
    .returnFields('Name')
    .useCursor()
    .returnScore()
    .partial()
    ;
    
    domain
     .query(qb)
     .execute((response) => {
       if (response.error) {
         console.error(response.isError);
         return;
       }
     
       console.log('Execution time (ms):', response.executionTime);
       console.log('Total matches:', response.totalMatched);
       
       //console.log('Facets:', response.facets);
       
       response.hits.forEach((hit) => {
         console.log('Hit:', hit);
       });
       
       // Scrolling to the next result set...
       response.scroll((response) => {
         // manage next page response here
       });
     })
}
```
