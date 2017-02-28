Creating secured AWS credentials
--------------------------------

In order to avoid excessive bills in case your AWS account get hacked
you may create secured credentials that suits DEEP requirements.

The AWS Services we are giving access to:
 - [Lambda](https://aws.amazon.com/lambda/)
 - [ElastiCache](https://aws.amazon.com/elasticache/) (disabled until VPC is available in lambdas)
 - [S3](https://aws.amazon.com/s3/)
 - [DynamoDB](https://aws.amazon.com/dynamodb/)
 - [CloudFront](https://aws.amazon.com/cloudfront/)
 - [APIGateway](https://aws.amazon.com/api-gateway/)
 - [Cognito](https://aws.amazon.com/cognito/)
 - [IAM](https://aws.amazon.com/iam/)
 - [SQS](https://aws.amazon.com/sqs/)
 - [ES](https://aws.amazon.com/elasticsearch-service/)

The steps
=========

 - Sign in to the `AWS Console`

![AWS Console login button](assets/console-login.png)

 - Choose `IAM` service from the `Services` dropdown

![Services dropdown](assets/services-dropdown.png)

![IAM Service](assets/iam-service.png)

 - Choose `Users` from the sidebar

![Users sidebar item](assets/users-item.png)

 - Click on the `Add User` button

![Add User button](assets/add-user-button.png)

 - Enter an username into the `User name` text field

![User Name text field](assets/username-textarea.png)

 - Check the `Programmatic access` option in the `Access type` area

![Access type checkbox](assets/access-type-checkbox.png)

 - Click on `Next: Permissions` at the bottom of the page

![Create button](assets/next-permissions-button.png)

 - Select the `Attach existing policies directly` option

![Attach policy button](assets/attach-policy-button.png)

 - Click on `Create Policy` button

![Create Policy button](assets/create-policy-button.png)

 - In the new opened tab click on `Connect` button for `Create Your Own Policy` option

![Select button](assets/create-policy-select-button.png)

 - Type a name for the policy in `Policy Name` text field

![Policy Name text area](assets/policy-name-textarea.png)

 - Copy the content of [secured IAM policy](assets/aws-secure-deep-policy.json) into the `Policy Document` text area

![Policy Document text area](assets/policy-document-textarea.png)

 - Click on `Create Policy` button

![Create Policy button](assets/create-policy-button2.png)

 - Switch back to the `Add user` tab and click on `Refresh` button

![Refresh button](assets/refresh-button.png)

 - Select the newly created policy from the list

![Select policy checkbox](assets/policy-checkbox.png)

 - Click on the `Next: Review` button

![Next Review button](assets/next-review-button.png)

 - Click on the `Create user` button at the bottom of the page

![Create user button](assets/create-user-button.png)

 - Click on the `Download .csv` button to save the credentials

![Download button](assets/download-button.png)

 - Done!

> Using credentials in the [deploy config](../tools/deploy.md#example-of-deeployjson)

> If your credentials were compromised you can make them inactive by clicking `Make inactive` link
> from the `Status` section in `Access Keys` of the chosen user ![Make Inactive](assets/make-inactive.png)

