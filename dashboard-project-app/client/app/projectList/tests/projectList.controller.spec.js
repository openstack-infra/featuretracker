'use strict';

describe('Component: ProjectListComponent', function () {

  // load the controller's module
  beforeEach(module('dashboardProjectApp'));

  var ProjectListComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    $componentController('ProjectListComponent', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
