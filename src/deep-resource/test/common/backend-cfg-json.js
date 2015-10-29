export default {
  "env": "dev",
  "deployId": "57ab88586908711b772ea66fcdf31eae",
  "awsRegion": "us-west-2",
  "models": [
    {
      "Name": {
        "Name": "string",
        "Id": "timeUUID"
      }
    }
  ],
  "identityPoolId": "us-east-1:51ecb374-d0f0-469e-955b-12da264525ef",
  "identityProviders": {
    "www.amazon.com": "amzn1.application.3b5k2jb53252352kjh5b23kj5hb"
  },
  "microservices": {
    "hello.world.example": {
      "isRoot": false,
      "parameters": {},
      "resources": {
        "sample": {
          "say-hello": {
            "type": "lambda",
            "methods": [
              "POST"
            ],
            "forceUserIdentity": true,
            "region": "us-west-2",
            "source": {
              "api": "https://1zf47jpvxd.execute-api.us-west-2.amazonaws.com/dev/hello-world-example/sample/say-hello",
              "original": "arn:aws:lambda:us-west-2:389617777922:function:DeepDevSampleSayHello64211f3705a"
            }
          },
          "say-bye": {
            "type": "lambda",
            "methods": [
              "GET"
            ],
            "forceUserIdentity": true,
            "region": "us-west-2",
            "source": {
              "api": "https://1zf47jpvxd.execute-api.us-west-2.amazonaws.com/dev/hello-world-example/sample/say-bye",
              "original": "arn:aws:lambda:us-west-2:389617777922:function:DeepDevSampleSayBye64211f3705a"
            }
          },
          "say-test": {
            "type": "external",
            "methods": [
              "GET"
            ],
            "forceUserIdentity": true,
            "region": "us-west-2",
            "source": {
              "api": "https://1zf47jpvxd.execute-api.us-west-2.amazonaws.com/dev/hello-world-example/sample/say-test",
              "original": "http://petstore.swagger.io/v2/store/inventory"
            }
          }
        }
      }
    },
    "deep.ng.root": {
      "isRoot": true,
      "parameters": {},
      "resources": {}
    }
  },
  "globals": {
    "userProviderEndpoint": "@deep.auth:user-retrieve",
    "security": {
      "identityProviders": {
        "www.amazon.com": "amzn1.application.3b5k2jb53252352kjh5b23kj5hb"
      }
    }
  },
  "microserviceIdentifier": "hello.world.example",
  "awsAccountId": 389617777922,
  "appIdentifier": "45asd88620d1e4eea9c3",
  "timestamp": 1445867176360,
  "buckets": {
    "temp": {
      "name": "deep.dev.temp.11f3705a"
    },
    "public": {
      "website": "deep.dev.public.11f3705a.s3-website-us-west-2.amazonaws.com",
      "name": "deep.dev.public.11f3705a"
    },
    "system": {
      "name": "deep.dev.system.11f3705a"
    }
  },
  "tablesNames": {
    "Name": "DeepDevName11f3705a"
  }
}
