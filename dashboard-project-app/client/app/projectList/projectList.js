'use strict';

angular.module('dashboardProjectApp').config(function ($stateProvider) {
    $stateProvider
        .state('projectList', {
            url: '/projectList',
            templateUrl: 'app/projectList/views/projectList.html',
            controller: 'projectListCtrl'
        });
});
