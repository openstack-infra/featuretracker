'use strict';

angular.module('dashboardProjectApp').controller('projectListCtrl', function(
    $scope,
    UserStory
){
    var data = [];
    var lastUpdate;
    function getFiles() {
        UserStory.find(
        function success(userStories, fillTable) {
            new Promise(function(resolve, reject) {
                var stringDate, realDate;

                userStories.forEach(function each (story) {
                    if(story.latestUpdate !== undefined) {
                        lastUpdate = moment(story.latestUpdate[0].value).format("MM-DD-YYYY");
                    } else {
                        lastUpdate = moment(story.date, "DD-MM-YYYY").format("MM-DD-YYYY");
                    }
                    data.push(
                        {
                            userStory: story.id+'-'+story.description,
                            dateCreated: moment(story.date, "DD-MM-YYYY").format("MM-DD-YYYY"),
                            lastUpdate: lastUpdate,
                            completed: story.percentage
                        }
                    )
                    resolve(data);
                });
            })
            .then(function(result) {
                $(function () {
                    $('#table').bootstrapTable({
                        data: data
                    });
                });
            });
        });
    };
    getFiles();
});
