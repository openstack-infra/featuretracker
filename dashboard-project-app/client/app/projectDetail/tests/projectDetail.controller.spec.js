'use strict';

describe('Component: ProjectDetailComponent', function () {

  // load the controller's module
  beforeEach(module('dashboardProjectApp'));

  var ProjectDetailComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    $componentController('ProjectDetailComponent', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
