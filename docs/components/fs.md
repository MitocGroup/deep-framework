deep-fs
======

Examples
--------

```javascript
let app = DeepFramework.Kernel;
let fs = app.get('fs');

let public = fs.public; // this is the S3 static website hosting bucket
let system = fs.system; // persistent folder (actually S3 bucket)
let tmp = fs.tmp; // temporary folder (actually S3 bucket, cleaned up by a process)

system.readFile('some/file.txt', function() {
    // ...
});
```

> `deep-fs` module is built on top of [s3fs](https://github.com/RiptideCloud/s3fs) that mimics nodejs native `fs` module