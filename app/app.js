'use strict';
var FIREBASE_URL = "https://quiz-96352.firebaseio.com";
var config = {
    apiKey: "AIzaSyDRgv-TmP0mEumG2ZxkK6dhmlOdnaNnKto",
    authDomain: "quiz-96352.firebaseapp.com",
    databaseURL: "https://quiz-96352.firebaseio.com",
    storageBucket: "quiz-96352.appspot.com",
    messagingSenderId: "72683451678"
};
firebase.initializeApp(config);

var app = angular.module('quizApp', ['ngRoute', 'ngSanitize', 'timer', 'firebase']);
// Routing has been added to keep flexibility in mind. This will be used in future.
angular.module('quizApp')
.config(['$routeProvider',
  function ($routeProvider) {

      var routes = [
          {
              url: '/home',
              template: 'templates/quiz.html',
              controller: 'quizCtrl'
          },
          {
              url: '/review',
              template: 'templates/review.html',
              controller: 'reviewCtrl'
          },
          //{
          //    url: '/result',
          //    template: 'templates/result.html',
          //    controller: 'resultCtrl'
          //},
          //{
          //    url: '/create',
          //    template: 'templates/create.html',
          //    controller: 'createCtrl'
          //},
          {
              url: '/login',
              template: 'templates/login.html',
              controller: 'createCtrl'
          }
      ];

      routes.forEach(function (r, index) {
          $routeProvider.when(r.url, { templateUrl: r.template, controller: r.controller });
      });

      $routeProvider.otherwise({ redirectTo: '/home' });
  }]);


app.factory("users", ["$firebaseArray", "$firebaseObject",
    function($firebaseArray, $firebaseObject) {
        //var ref = new Firebase(FIREBASE_URL+'/users').ref();
        // create a reference to the database location where we will store our data
        var ref = firebase.database().ref().child('users');

        //ref.$loaded()
        //    .then(function(x) {
        //        console.log(x.length); // true
        //    })
        //    .catch(function(error) {
        //        console.log("Error:", error);
        //    });

        // this uses AngularFire to create the synchronized array
        return $firebaseObject(ref);
    }
]);
