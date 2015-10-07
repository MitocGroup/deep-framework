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
 
The steps
=========

 - Sign in to the `AWS Console`

![AWS Console login button](assets/console-login.png)

 - Choose `IAM` service from the `Services` dropdown

![Services dropdown](assets/services-dropdown.png)

![IAM Service](assets/iam-service.png)

 - Choose `Users` from the sidebar

![Users sidebar item](assets/users-item.png)

 - Click the `Create New Users` button

![Create New Users button](assets/new-users-button.png)

 - Enter an username in one of the `Enter User Names` text fields

![Enter User Names text fields](assets/enter-user-names.png)

 - Click `Create` at the bottom of the page

![Create button](assets/create-button.png)

 - Click on the `Hide User Security Credentials` spoiler link and SAVE your security credentials

![Credentials spoiler link](assets/credentials-dropdown.png)

 - Click on the `Close` button TWICE at the bottom of the page

![Close button](assets/close-credentials-button.png)

 - Click on your user from the user list

![User list](assets/user-list.png)

 - Click on the `Attach Policy` button from the `Permissions` section

![Attach Policy button](assets/attach-policy-button.png)

 - Select the following items from the list of `Policy Name`s:
   - [AWSLambdaFullAccess](https://console.aws.amazon.com/iam/home?region=us-west-2#policies/arn:aws:iam::aws:policy/AWSLambdaFullAccess)
   - [AmazonElastiCacheFullAccess](https://console.aws.amazon.com/iam/home?region=us-west-2#policies/arn:aws:iam::aws:policy/AmazonElastiCacheFullAccess)
   - [AmazonS3FullAccess](https://console.aws.amazon.com/iam/home?region=us-west-2#policies/arn:aws:iam::aws:policy/AmazonS3FullAccess)
   - [AmazonDynamoDBFullAccess](https://console.aws.amazon.com/iam/home?region=us-west-2#policies/arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess)
   - [CloudFrontFullAccess](https://console.aws.amazon.com/iam/home?region=us-west-2#policies/arn:aws:iam::aws:policy/CloudFrontFullAccess)
   - [AmazonAPIGatewayAdministrator](https://console.aws.amazon.com/iam/home?region=us-west-2#policies/arn:aws:iam::aws:policy/AmazonAPIGatewayAdministrator)
   - [AmazonCognitoPowerUser](https://console.aws.amazon.com/iam/home?region=us-west-2#policies/arn:aws:iam::aws:policy/AmazonCognitoPowerUser)
   
![Policy Names list](assets/policy-names-list.png) 

 - Click on the `Attach Policy` button at the bottom of the page

![Attach Policy button](assets/attach-policy-list-button.png)

 - Go to the `Inline Policies` section and click on the arrow from the right side to open the spoiler

![Inline Policies section](assets/inline-policies-section.png)

 - Click on the `click here` link inside the `Inline Policies` spoiler

![click here link](assets/click-here-link.png)

 - Select the `Custom Policy` list item and than on the appeared `Select` button

![Custom Policy item](assets/custom-policy-item.png)

 - Copy the content of [secured IAM policy](assets/aws-secure-deep-policy.json) into the `Policy Document` text area

![Policy Document text area](assets/policy-document-textarea.png)

 - Type a name for the policy in `Policy Name` text field

![Policy Name text field](assets/policy-name-text-field.png)

 - Click on the `Apply Policy` button from the bottom of the page

![Apply Policy button](assets/apply-policy-button.png)

 - Done!

> Using credentials in the [deploy config](../tools/deploy.md#example-of-deeployjson)

> If your credentials were compromised you can make them inactive by clicking `Make Inactive` link
> from the `Actions` section in `Access Keys` of the chosen user ![Make Inactive](assets/make-credentials-inactive.png)