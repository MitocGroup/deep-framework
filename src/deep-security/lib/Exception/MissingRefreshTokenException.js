/**
 * Created by CCristi on 3/4/17.
 */

'use strict';

import {IdentityProviderTokenExpiredException} from './IdentityProviderTokenExpiredException';


export class MissingRefreshTokenException extends IdentityProviderTokenExpiredException {
  constructor() {
    super('Missing refresh token');
  }
}
