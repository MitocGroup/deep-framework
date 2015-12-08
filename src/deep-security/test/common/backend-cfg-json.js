export default {
  env: 'dev',
  deployId: '65ab34689468924b655ae66fcdf31eae',
  awsRegion: 'us-west-2',
  models: [
    {
      Name: {
        Name: 'string',
        Id: 'timeUUID',
      },
    },
  ],
  identityPoolId: 'us-east-1:44hgf876-a2v2-465a-877v-12fd264525ef',
  identityProviders: {
    'www.amazon.com': 'amzn1.application.5g5k2jb86379368kjh5b23kj5hb',
  },
  microservices: {
    'hello.world.example': {
      isRoot: false,
      parameters: {},
      resources: {
        sample: {
          'say-hello': {
            type: 'lambda',
            methods: [
              'POST',
            ],
            forceUserIdentity: true,
            region: 'us-west-2',
            source: {
              api: 'https://1zf47jpvxd.execute-api.us-west-2.amazonaws.com/dev/hello-world-example/sample/say-hello',
              original: 'arn:aws:lambda:us-west-2:389615756922:function:DeepDevSampleSayHello64232f3705a',
            },
          },
          'say-bye': {
            type: 'lambda',
            methods: [
              'GET',
            ],
            forceUserIdentity: true,
            region: 'us-west-2',
            source: {
              api: 'https://6jh99kuklk.execute-api.us-west-2.amazonaws.com/dev/hello-world-example/sample/say-bye',
              original: 'arn:aws:lambda:us-west-2:389615756922:function:DeepDevSampleSayBye64232f3705a',
            },
          },
          'say-test': {
            type: 'external',
            methods: [
              'GET',
            ],
            forceUserIdentity: true,
            region: 'us-west-2',
            source: {
              api: 'https://6jh99kuklk.execute-api.us-west-2.amazonaws.com/dev/hello-world-example/sample/say-test',
              original: 'http://petstore.swagger.io/v2/store/inventory',
            },
          },
        },
      },
    },
    'deep.ng.root': {
      isRoot: true,
      resources: {},
      parameters: {
        frontend: {},
        backend: {},
        globals: {
          userProviderEndpoint: '@deep.mg.auth:user-retrieve',
          logDrivers: {
            sentry: {
              dsn: 'https://765456poi50e46a293e367d9db7c69ac:b98d6dcc48514731a35e34d57e388bcb@app.getsentry.com/48098',
            },
          },
          security: {
            identityProviders: {
              'www.amazon.com': 'amzn1.application.3b5k2jb65432352gfd5b23kj5hb',
            },
          },
        },
      },
    },
  },
  globals: {
    userProviderEndpoint: '@deep.auth:user-retrieve',
    security: {
      identityProviders: {
        'www.amazon.com': 'amzn1.application.3b5k2jb65432352gfd5b23kj5hb',
      },
    },
  },
  microserviceIdentifier: 'hello.world.example',
  awsAccountId: 389615756922,
  appIdentifier: '45asd88620d1e4eea543',
  timestamp: 1445867176360,
  buckets: {
    temp: {
      name: 'deep.dev.temp.32f3705a',
    },
    public: {
      website: 'deep.dev.public.32f3705a.s3-website-us-west-2.amazonaws.com',
      name: 'deep.dev.public.32f3705a',
    },
    system: {
      name: 'deep.dev.system.32f3705a',
    },
  },
  tablesNames: {
    Name: 'DeepDevName32f3705a',
  },
};
