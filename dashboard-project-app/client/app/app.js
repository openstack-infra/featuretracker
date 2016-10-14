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
  .config(function($urlRouterProvider, $locationProvider, LoopBackResourceProvider, appConfig) {
      LoopBackResourceProvider.setUrlBase(appConfig.apiBaseUrl);
    //$urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
  })
  .run(function($rootScope, $state) {
      $state.go("projectList")
  });
