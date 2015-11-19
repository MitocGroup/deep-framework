import {LocalDynamo} from '../../../lib.compiled/Local/Driver/LocalDynamo';

export class LocalDynamoMock extends LocalDynamo {
  constructor(...args) {
    super(args);
  }
}
