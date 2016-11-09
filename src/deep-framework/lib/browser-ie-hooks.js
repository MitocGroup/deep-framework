'use strict';

/* eslint no-extend-native:0 */

if (!Function.prototype.name) {
  if (!Object.defineProperty) {
    console.error('Cannot define "Function.prototype.name" getter');
  } else {
    Object.defineProperty(Function.prototype, 'name', {
      get: function() {
        const matches = this.toString().match(/^\s*function\s+([^(]{1,})\(/i);

        return matches && matches.length > 1 ? matches[1].trim() : null;
      },
      set: function(value) {}
    }); 
  }
}
