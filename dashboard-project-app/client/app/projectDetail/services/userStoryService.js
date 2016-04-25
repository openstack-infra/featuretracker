angular.module('dashboardProjectApp')
  .service('UserStoryService', ['$http','UserStory', function($http, UserStory) {

    this.searchTask = function(query) {
      //return $http.get('/tasks/search/' + query);
    };

    $scope.getUserStory = function getFiles() {

      console.log('aaaaaaa')
      return UserStory.findById({id:$scope.taskId});
    };

    this.getTask = function(name) {
      //return $http.get('/tasks/' + name);
      return {};
    };
  }]);
