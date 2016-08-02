/**
 * Created by AlexanderC on 12/8/15.
 */

'use strict';

import RFC3986 from './rfc3986';

export default {
  createUriRegex: (optionalScheme) => {
    let scheme = RFC3986.scheme;

    // If we were passed a scheme, use it instead of the generic one
    if (optionalScheme) {

      // Have to put this in a non-capturing group to handle the OR statements
      scheme = '(?:' + optionalScheme + ')';
    }

    /**
     * URI = scheme ":" hier-part [ "?" query ] [ "#" fragment ]
     */
    return new RegExp(`^${scheme}:${RFC3986.hierPart}(?:\\?${RFC3986.query})?(?:#${RFC3986.fragment})?$`);
  },
};
