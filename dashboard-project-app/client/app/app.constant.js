(function(angular, undefined) {
'use strict';

angular.module('dashboardProjectApp.constants', [])

.constant('appConfig', {userRoles:['guest','user','admin'],apiBaseUrl:'http://local.userstory.openstack.org/api'})

;
})(angular);