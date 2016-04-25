module.exports = function(Blueprint) {
    
    Blueprint.url = function(projectName, blueprintName, cb) {
        var url = 'https://blueprints.launchpad.net/' + projectName + '/+spec/' + blueprintName;
        cb(null, url);
    }

    Blueprint.remoteMethod(
        'url',
        {
            accepts: [
                {arg: 'projectName', type: 'string', required: true},
                {arg: 'blueprintName', type: 'string', required: true}
            ],
            http: {verb: 'get'},
            returns: {arg: 'url', type: 'string'}
        }
    );
};
