/**
 * Created by AlexanderC on 5/22/15.
 *
 * Bootstrap file loaded by npm as main
 */

'use strict';

import {Interface as OOPInterface} from './OOP/Interface';
import {Runtime as AWSLambdaRuntime} from './AWS/Lambda/Runtime';
import {Region as AWSRegion} from './AWS/Region';
import {Service as AWSService} from './AWS/Service';
import {Policy as AWSIAMPolicy} from './AWS/IAM/Policy';
import {Factory as AWSIAMFactory} from './AWS/IAM/Factory';
import {ObjectStorage as GenericObjectStorage} from './Generic/ObjectStorage';
import {UniversalRequire as GenericUniversalRequire} from './Generic/UniversalRequire';
import {ObjectVector as GenericObjectVector} from './Generic/ObjectVector';
import {MethodsProxy as GenericMethodsProxy} from './Generic/MethodsProxy';
import {Exception as ExceptionException} from './Exception/Exception';
import {MethodsNotImplementedException as ExceptionMethodsNotImplementedException} from
  './Exception/MethodsNotImplementedException';
import {InvalidArgumentException as ExceptionInvalidArgumentException} from './Exception/InvalidArgumentException';
import {DatabaseOperationException as ExceptionDatabaseOperationException}
  from './Exception/DatabaseOperationException';
import {ResourceNotFoundException as ExceptionResourceNotFoundException} from './Exception/ResourceNotFoundException';
import {Sandbox as RuntimeSandbox} from './Runtime/Sandbox';
import {Helper as HttpHelper} from './HTTP/Helper';

module.exports = {
  IS_DEV_SERVER: global.__DEEP_DEV_SERVER || false,
  Exception: {
    Exception: ExceptionException,
    InvalidArgumentException: ExceptionInvalidArgumentException,
    MethodsNotImplementedException: ExceptionMethodsNotImplementedException,
    DatabaseOperationException: ExceptionDatabaseOperationException,
    ResourceNotFoundException: ExceptionResourceNotFoundException,
  },
  HTTP: {
    Helper: HttpHelper,
  },
  Runtime: {
    Sandbox: RuntimeSandbox,
  },
  OOP: {
    Interface: OOPInterface,
  },
  Generic: {
    ObjectStorage: GenericObjectStorage,
    ObjectVector: GenericObjectVector,
    MethodsProxy: GenericMethodsProxy,
    UniversalRequire: GenericUniversalRequire,
  },
  AWS: {
    Region: AWSRegion,
    Service: AWSService,
    IAM: {
      Factory: AWSIAMFactory,
      Policy: AWSIAMPolicy,
    },
    Lambda: {
      Runtime: AWSLambdaRuntime,
    },
  },
};
