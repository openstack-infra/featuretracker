'use strict';
(function(){

  angular.module('dashboardProjectApp')
    .controller('projectDetailController', ['$scope','$state', 'UserStory'/*, 'tasksService', 'tasks', 'task'*/,
      function($scope, $state, UserStory/*, tasksService, tasks, task*/) {

        $scope.taskId = $state.params.id;
        $scope.openTasks = {};
        $scope.showText = {}

        $scope.closeTask = function(task){
          $scope.openTasks[task] = !$scope.openTasks[task];
        }

        $scope.getProjectIcon = function(key){

          if(key == 'nova')
            return 'fa fa-cogs';

          if(key == 'cinder')
            return 'fa fa-archive'

          if(key == 'keystone')
            return 'fa fa-key';

          if(key == 'swift')
            return 'fa fa-object-group';

          if(key == 'neutron')
            return 'fa fa-cloud-upload';

          if(key == 'glance')
            return 'fa fa-key';

          return 'fa fa-cog';
        }

        $scope.actualProject = {};

        function getFile() {
          UserStory.findById({id:$scope.taskId},
            function success(userStory) {
              $scope.userStory  = userStory;

                $scope.userStory.updatedOn =  moment($scope.userStory.updatedOn).format("MM-DD-YYYY");
                for(var key in $scope.userStory.tasks_status) {
                  $scope.actualProject[key] = $scope.userStory.tasks_status[key].projects[0]
                }

            });
        };

        $scope.selectProject = function(keyProject,  idTask){
          $scope.actualProject[idTask] = keyProject
        }

       getFile();

        $scope.showMore = function(key){
          $scope.showText[key] = true;
        }

        $scope.showLess = function(key){
          $scope.showText[key] = false;
        }

        $scope.mailTo = function(user, email){
          window.location.href = "mailto:" + email + "?subject=Mail to " + email;
        }


      }])
  .filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
  }).filter('removeDashes', function() {
      return function(string) {

        if (!angular.isString(string)) {
          return string;
        }

        return string.replace(/-/g, ' ');
      };
    })

})();
