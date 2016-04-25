'strict mode';
var async = require('async');

module.exports = function(Rst) {

  Rst.afterRemote('list', function (ctx, response, next) {
    next();
  });

};
