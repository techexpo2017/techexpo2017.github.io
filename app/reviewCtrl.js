app.controller('reviewCtrl', ['$scope', '$http', '$location', '$rootScope', "$firebaseArray", "$firebaseObject", 'users',
    function($scope, $http, $location, $rootScope, $firebaseArray, $firebaseObject, users) {

        console.log("Review");
        $scope.getUsers = function(){
            var users = $firebaseArray(firebase.database().ref().child('users'));
            users.$loaded().then(function(r){
               $scope.users = users;
            });
        };
        $scope.getUsers();

    }]);