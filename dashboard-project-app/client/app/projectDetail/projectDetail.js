'use strict';

angular.module('dashboardProjectApp')
  .config(function ($stateProvider) {

    $stateProvider
      .state('projectDetail', {
        url: '/projectDetail/:id',
       /* resolve: {
          userStory: ['userStoryService',
         function(userStoryService) {
         return userStoryService.getTasks();
         }]
         },*/
        templateUrl: 'app/projectDetail/views/projectDetail.html',
        controller: 'projectDetailController'
      })

  });
