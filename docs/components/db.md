deep-db
======

> DB is built on top of [Vogels](https://github.com/ryanfitz/vogels) `Active Record` implementation.
> Note that `db.get(...)` would return a native `Vogels` model that you can work with.

Extended Model
-------------------------
Some of the default Vogels methods were wrapped in commodity methods.

* for the next method list cb will be a callback function that will be triggered with two parameters: a error as the first, if any, and the second will be
the response for the request.

- `Model.findAll(cb)`: Finds all the entries of a certain model. Use this consciously because it can put a lot of requests on DynamoDb, so also on your wallet.

- `Model.findOneById(Id, cb)`: Find one entry by it's Id from the first parameter.

- `Model.findOneBy(fieldName, fieldValue, cb)`: Finds the first entry that has the field value specified.

- `Model.findBy(fieldName, fieldValue, cb, limit)`: Finds the entries that have the specified value with a limit. If some don't specify.
a limit, the default will be 10.

- `Model.findAllBy(fieldName, fieldValue, cb)`: Same as the last two, but returns all the entries found.

- `Model.findMatching(params, cb, limit)`: Gets as input a key-value object and returns the entries that correspond to it, limited by the last parameter, or 
by the default 10.

- `Model.findOneMatching(params, cb)`: Same as the above but returns only one.

- `Model.findAllMatching(params, cb)`: Same as the above two, but returns all the entries.

- `Model.deleteById(Id, cb)`:  Deletes an entry by it's Id.

- `Model.createItem(data, cb)`: Insert an entry to the database.

- `Model.createUniqueOnFields(fields, data, cb)`: Creates a unique entry for the specified fields in the first parameter as an array. For example if some want
to create an unique entry on PersonalEmail and WorkEmail, the function should be called with:
```javascript
Model.createUniqueOnFields(
    ["PersonalEmail", "WorkEmail"],
    {
        ...,
        "PersonalEmail": "user@example.com",
        "WorkEmail":     "user.work@example.com",
        ...
    },
    function(err, response) {...}
    );
```

In this case the entry will be created if there doesn't exist any entry with the same values for both fields

Examples
--------

```javascript
let app = DeepFramework.Kernel;
let db = app.get('db');

console.log(db.models);

if (db.has('User')) {
    let User = db.get('User');
    
    User.create({
        "email": "foo-bar@example.com",
        "first_name": "Foo",
        "last_name": "Bar"
    }, function (err, user) {
        if (err) {
            console.log('Error on creating user: ' + err);
        } else {
            console.log('Created user at', user.get('createdAt'));
    
            user.set({
                email: 'bar-foo@example.com'
            });
    
            user.update(function (err) {
                if (err) {
                    console.log('Error on updating user email: ' + err);
                } else {
                    console.log('Updated user email');
                }
            });
        }
    });
}
```



Models Anatomy
--------------

See [deep-validation](validation.md#models-anatomy) `Models Anatomy` section

Migration Example
----------------

> Migration file have to match {`/^version(\d+)$/i`}.js

```javascript
var NAME_DATA = [
			{Name: 'Eugene'},
			{Name: 'Alex'},
			{Name: 'Marcel'},
			{Name: 'John Cena'},
		];

module.exports = {
	up: function(db, cb) {
		var i = 0;
		var name = db.get('Name');
		var wait = new this.waitFor;
		var remaining = NAME_DATA.length;

		wait.push(function() {
			return remaining <= 0;
		});

		NAME_DATA.forEach(function(payload) {
			name.create(payload, function(error, data) {
				if (error) {
					console.error(error);
				} else {
					i++;
					console.log('[' + i + '] New "Name" item created:', payload.Name);
				}

				remaining--;
			});
		});

		wait.ready(cb);
	},
	down: function(db, cb) { // OPTIONAL
	  // TBD
	},
};
```

> Please note that you have an injected context in the `up()` method

```javascript
{
    awsAsync: [AwsRequestSyncStack](https://github.com/MitocGroup/deep-package-manager/blob/master/src/lib/Helpers/AwsRequestSyncStack.js),
    waitFor: [WaitFor](https://github.com/MitocGroup/deep-package-manager/blob/master/src/lib/Helpers/WaitFor.js),
}
```
