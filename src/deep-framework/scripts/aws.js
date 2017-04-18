const AWS = require('aws-sdk/global');

AWS.Lambda = require('aws-sdk/clients/lambda');
AWS.CognitoIdentity = require('aws-sdk/clients/cognitoidentity');
AWS.CognitoSync = require('aws-sdk/clients/cognitosync');
AWS.SQS = require('aws-sdk/clients/sqs');

module.exports = AWS;
