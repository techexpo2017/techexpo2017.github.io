app.controller('createCtrl', ['$scope', '$http', '$location', '$rootScope', "$firebaseArray", "$firebaseObject", 'users',
    function($scope, $http, $location, $rootScope, $firebaseArray, $firebaseObject, users) {

        $scope.quizName = 'data/designPatterns.json';
        $scope.users = users;
        $scope.isInvalidUser = false;
        $scope.loader = false;

        $scope.addUser = function() {
            $scope.users[$scope.userName] = {"userName": $scope.userName};
            $scope.users.$save().then(function(result) {
                console.log(result);
                $scope.loader = false;
                $location.path('/home');
            });
        };
        $scope.getUsers = function(){
            var users = $firebaseObject(firebase.database().ref().child('users'));
            users.$loaded().then(function(r){
                if(r[$scope.userName]) {
                    $scope.isInvalidUser = true;
                    $scope.loader = false;
                } else {
                    $scope.addUser();
                }
                $scope.loader = false;
            });
        };
        $scope.startTest = function() {
            $scope.loader = true;
            $rootScope.userName = $scope.userName;
            if ($scope.userName && $scope.userName !== "Guest") {
                $scope.getUsers();
            }
        }
    }]);
