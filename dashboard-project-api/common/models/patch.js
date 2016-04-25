'strict mode';
var async = require('async');

module.exports = function(Patch) {
    Patch.afterRemote('list', function (ctx, response, next) {
        var data = [];

        response = JSON.parse(response.substring(5));
        async.waterfall([
            function createOutput(next){
                response.forEach( function each (element){
                    data.push(
                    {
                        url: "https://review.openstack.org/#/c/" + element._number,
                        name: element.subject
                    });
                });
                next();
            },
            function sendData (next) {
                ctx.result = data;
                next;
            }
        ], next);
        next();
    });

    Patch.afterRemote('latestUpdate', function (ctx, response, next) {
        var data = [];

        response = JSON.parse(response.substring(5));
        async.waterfall([
            function createOutput(next){
                response.forEach( function each (element){
                    data.push(
                    {
                        latestDate: element.updated,
                    });
                });
                next();
            },
            function sendData (next) {
                data = data.sort();
                var lastUpdate =  data.shift();
                ctx.result = lastUpdate;
                next;
            }
        ], next);
        next();
    });
};
