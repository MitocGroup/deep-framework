Roadmap of DEEP Framework
=========================

Our list of roadmap features and functionality, in descending order of priority:

- [x] Implement deep-search: *Full text search service on top of [Amazon CloudSearch](https://aws.amazon.com/cloudsearch) and/or [Amazon Elasticsearch Service](https://aws.amazon.com/elasticsearch-service)*
- [x] Implement deep-db "eventual consistency": *Achieve "eventual consistency" by offloading data to [SQS](https://aws.amazon.com/sqs) as the default option*
- [x] Improve deep-db "strong consistency": *Achieve "strong consistency" by increasing Reads/Writes per second in runtime (as other option for special DB operations)*
- [ ] Implement deep-security: *Security service on top of [Amazon IAM](https://aws.amazon.com/iam) and/or [Amazon Cognito](https://aws.amazon.com/cognito)*
- [ ] Implement [RUM](https://en.wikipedia.org/wiki/Real_user_monitoring): *Add Real User Monitoring by logging all user actions and visualize them with an [ELK stack](https://www.elastic.co/webinars/introduction-elk-stack)*
- [ ] Implement blue-green deployment: *Deploy applications using `deepify` with zero downtime; Scalable to support multiple environments and multiple regions*
- [ ] Implement deep-event: *Event manager service using Lambda scheduling, Kinesis stream, Dynamo streaming, SQS, etc*
- [ ] Implement deep-notification: *Push notification service on top of [SNS](https://aws.amazon.com/sns) that supports push to mobile devices, web browsers, email and sms*
- [ ] Implement deep-queue: *Queue data into [SQS](https://aws.amazon.com/sqs) and/or [Kinesis](https://aws.amazon.com/kinesis)*
- [ ] Implement deep-cache: *Cache service on top of [Elasticache](https://aws.amazon.com/elasticache) ([Redis](http://redis.io) engine) inside deep-resource (e.g. AWS Lambda)*
- [ ] Integrate deep-db with deep-cache natively: *Cache fetched data by default using deep-cache library*
- [ ] Improve documentation for each deep-* library: *Update docs for deep libraries and development tools*
