export default {
  env: 'dev',
  deployId: 'a44dd54d',
  awsRegion: 'us-west-2',
  models: [
    {
      name: {
        Name: 'string',
      },
    },
  ],
  identityPoolId: 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xx0123456789',
  identityProviders: '',
  microservices: {
    'deep-hello-world': {
      isRoot: false,
      parameters: {},
      resources: {
        'say-hello': {
          'create-msg': {
            type: 'lambda',
            methods: [
              'POST',
            ],
            forceUserIdentity: true,
            validationSchema: 'name-data',
            apiCache: {
              enabled: false,
              ttl: -1,
            },
            region: 'us-west-2',
            scope: 'public',
            source: {
              api: '/deep-hello-world/say-hello/create-msg',
              original: 'arn:aws:lambda:::function:deep-hello-world-say-hello-create-msg',
              _localPath: './src/deep-hello-world/backend/src/say-hello/create-msg/bootstrap.js',
            },
          },
          'create-fs': {
            type: 'lambda',
            methods: [
              'POST',
            ],
            forceUserIdentity: true,
            validationSchema: 'name-data',
            apiCache: {
              enabled: false,
              ttl: -1,
            },
            region: 'us-west-2',
            scope: 'public',
            source: {
              api: '/deep-hello-world/say-hello/create-fs',
              original: 'arn:aws:lambda:::function:deep-hello-world-say-hello-create-fs',
              _localPath: './src/deep-hello-world/backend/src/say-hello/create-fs/bootstrap.js',
            },
          },
          'create-db': {
            type: 'lambda',
            methods: [
              'POST',
            ],
            forceUserIdentity: true,
            validationSchema: 'name-data',
            apiCache: {
              enabled: false,
              ttl: -1,
            },
            region: 'us-west-2',
            scope: 'public',
            source: {
              api: '/deep-hello-world/say-hello/create-db',
              original: 'arn:aws:lambda:::function:deep-hello-world-say-hello-create-db',
              _localPath: './src/deep-hello-world/backend/src/say-hello/create-db/bootstrap.js',
            },
          },
        },
      },
    },
    'deep-root-vanilla': {
      isRoot: true,
      parameters: {},
      resources: {
        'async-config': {
          dump: {
            type: 'lambda',
            methods: [
              'GET',
            ],
            forceUserIdentity: false,
            apiCache: {
              enabled: false,
              ttl: -1,
            },
            region: 'us-west-2',
            scope: 'private',
            source: {
              api: null,
              original: 'arn:aws:lambda:::function:deep-root-vanilla-async-config-dump',
              _localPath: './src/deep-root-vanilla/backend/src/async-config/dump/bootstrap.js',
            },
          },
        },
        scheduler: {
          rule: {
            type: 'lambda',
            methods: [
              'GET',
            ],
            forceUserIdentity: false,
            apiCache: {
              enabled: false,
              ttl: -1,
            },
            region: 'us-west-2',
            scope: 'private',
            source: {
              api: null,
              original: 'arn:aws:lambda:::function:deep-root-vanilla-scheduler-rule',
              _localPath: './src/deep-root-vanilla/backend/src/scheduler/rule/bootstrap.js',
            },
          },
        },
        'ddb-eventual-consistency': {
          'listen-queues': {
            type: 'lambda',
            methods: [
              'GET',
            ],
            forceUserIdentity: false,
            apiCache: {
              enabled: false,
              ttl: -1,
            },
            region: 'us-west-2',
            scope: 'private',
            source: {
              api: null,
              original: 'arn:aws:lambda:::function:deep-root-vanilla-ddb-eventual-consistency-listen-queues',
              _localPath: './src/deep-root-vanilla/backend/src/ddb-eventual-consistency/listen-queues/bootstrap.js',
            },
          },
          'pool-queue': {
            type: 'lambda',
            methods: [
              'GET',
            ],
            forceUserIdentity: false,
            apiCache: {
              enabled: false,
              ttl: -1,
            },
            region: 'us-west-2',
            scope: 'private',
            source: {
              api: null,
              original: 'arn:aws:lambda:::function:deep-root-vanilla-ddb-eventual-consistency-pool-queue',
              _localPath: './src/deep-root-vanilla/backend/src/ddb-eventual-consistency/pool-queue/bootstrap.js',
            },
          },
        },
      },
    },
  },
  globals: {
    favicon: '@deep-root-vanilla:img/favicon.ico',
    pageLoader: {
      src: '@deep-root-vanilla:img/loader.gif',
      alt: 'Loading...',
    },
    engine: {
      ngRewrite: '/',
    },
  },
  searchDomains: {},
  validationSchemas: [
    'name-data',
  ],
  modelsSettings: [
    {
      name: {
        readCapacity: 1,
        writeCapacity: 1,
        maxReadCapacity: 10000,
        maxWriteCapacity: 10000
      },
    },
  ],
  forceUserIdentity: false,
  microserviceIdentifier: 'deep-hello-world',
  awsAccountId: 123456789123,
  appIdentifier: 'gfhfgdhfghgjgh7687687fghgfhgf',
  timestamp: 1465996738254,
  buckets: {
    temp: {
      name: 'fdgfd56765gfhjgj768768ghjjhgjhg898-temp',
    },
    public: {
      name: 'fdgfd56765gfhjgj768768ghjjhgjhg898-public',
    },
    private: {
      name: 'fdgfd56765gfhjgj768768ghjjhgjhg898-private',
    },
    shared: {
      name: 'fdgfd56765gfhjgj768768ghjjhgjhg898-shared',
    },
  },
  tablesNames: {
    name: 'DeepDevName4a7dbaed',
  },
  cacheDsn: '',
  name: 'deep-hello-world-say-hello-create-db',
  path: './src/deep-hello-world/backend/src/say-hello/create-db/bootstrap.js',
};