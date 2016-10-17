'use strict';

angular.module('dashboardProjectApp')
  .config(function ($stateProvider) {

    $stateProvider
      .state('projectDetail', {
        url: '/projectDetail/:id',
        templateUrl: 'app/projectDetail/views/projectDetail.html',
        controller: 'projectDetailController'
      })

  });
