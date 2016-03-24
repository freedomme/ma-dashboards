'use strict';

angular.module('mdAdminApp').directive('login', ['$state', 'User', function($state, User) {
	return {
		templateUrl: 'directives/login/login.html',
		scope: {},
		link: function($scope, $element, attrs) {
			$scope.errors = {};
			
			$scope.$watchGroup(['username', 'password'], function() {
				delete $scope.errors.invalidLogin;
			});
			
			$scope.doLogin = function() {
				var user = User.login({
					username: $scope.username,
					password: $scope.password
				});
				user.$promise.then(function() {
					var redirect = 'dashboard.home';
					if ($state.loginRedirect) {
						redirect = $state.loginRedirect;
						delete $state.loginRedirect;
					}
					$state.go(redirect);
				}, function(error) {
					if (error.status === 406) {
						$scope.errors.invalidLogin = true;
					}
					else {
						$scope.errors.otherError = error.statusText || 'Connection refused';
					}
				});
			}
		}
	};
}]);
