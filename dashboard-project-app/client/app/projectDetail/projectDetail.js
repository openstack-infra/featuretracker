'use strict';

angular.module('dashboardProjectApp')
  .config(function ($stateProvider, $urlRouterProvider) {

 
    $stateProvider

    .state('error', {
        url: '/projectDetail/notFound/:id',
        templateUrl: 'app/projectDetail/views/notFound.html',
        controller: function($scope, $state){
        	$scope.id = $state.params.id;
        }
    })


    .state('projectDetail', {
        url: '/projectDetail/:id',
        templateUrl: 'app/projectDetail/views/projectDetail.html',
        controller: 'projectDetailController'
    })
     

  });
