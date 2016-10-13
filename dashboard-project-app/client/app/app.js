'use strict';

angular.module('dashboardProjectApp', [
  'dashboardProjectApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'lbServices'
])
  .config(function($urlRouterProvider, $locationProvider, LoopBackResourceProvider) {
      LoopBackResourceProvider.setUrlBase('http://local.userstory.openstack.org/api');
    //$urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
  })
  .run(function($rootScope, $state) {
      $state.go("projectList")
  });
