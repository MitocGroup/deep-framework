'use strict';

if (Function.prototype.name === undefined) {
  if (Object.defineProperty === undefined) {
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
