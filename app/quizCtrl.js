var quizCtrl = function ($scope, $http, $location, $rootScope, $timeout, $firebaseArray, $firebaseObject, helper, users) {
    $scope.quizName = 'data/designPatterns.json';
    $scope.timedout = false;
    $scope.timerColor = "btn-info";
    $scope.submitCalled = false;
    $scope.users = users;

    if(!$rootScope.userName) {
        $location.path("/login");
    }

    //Note: Only those configs are functional which is documented at: http://www.codeproject.com/Articles/860024/Quiz-Application-in-AngularJs
    // Others are work in progress.
    $scope.defaultConfig = {
        'allowBack': true,
        'allowReview': true,
        'autoMove': true,  // if true, it will move to next question automatically when answered.
        'duration': 0,  // indicates the time in which quiz needs to be completed. post that, quiz will be automatically submitted. 0 means unlimited.
        'pageSize': 1,
        'requiredAll': false,  // indicates if you must answer all the questions before submitting.
        'richText': false,
        'shuffleQuestions': false,
        'shuffleOptions': false,
        'showClock': false,
        'showPager': true,
        'theme': 'none',
        'totalQuestions' : 5
    };
    $scope.totalCorrectAnswers = $scope.defaultConfig.totalQuestions;

    $scope.goTo = function (index) {
        if (index > 0 && index <= $scope.totalItems) {
            $scope.currentPage = index;
            $scope.mode = 'quiz';
        }
    };

    $scope.$on('timer-tick', function (event, data) {
        if ($scope.mode === 'quiz' || $scope.mode === 'review') {
            if(data.millis/1000 < 10) {
                $scope.timerColor = "btn-danger";
                $scope.$apply($scope.timerColor);
            } else if(data.millis/1000 < 20) {
                $scope.timerColor = "btn-warning";
                $scope.$apply($scope.timerColor);
            }
        }
    });

    $scope.onSelect = function (question, option) {
        if (question.QuestionTypeId == 1) {
            question.Options.forEach(function (element, index, array) {
                if (element.Id != option.Id) {
                    element.Selected = false;
                    //question.Answered = element.Id;
                }
            });
        }
        if ($scope.config.autoMove == true && $scope.currentPage < $scope.totalItems)
            $scope.currentPage++;
    };

    $scope.onSubmit = function () {
        $scope.submitCalled = true;
        if($scope.mode !== 'feedback'){
            $scope.mode = 'feedback';

        } else {
            $scope.mode = 'result';
            var answers = [];
            var abort = false;
            $scope.questions.forEach(function (q, index) {
                answers.push({ 'QuizId': $scope.quiz.Id, 'QuestionId': q.Id, 'Answered': q.Answered });
                abort = false;
                console.log(q.Name);
                q.Options.forEach(function (option, index, array) {
                    console.log(helper.toBool(option.Selected) + " : " + option.IsAnswer);
                    if (!abort && helper.toBool(option.Selected) !== option.IsAnswer ) {
                        $scope.totalCorrectAnswers--;
                        abort = true;
                    }
                });
            });
            // Post your data to the server here. answers contains the questionId and the users' answer.
            //$http.post('api/Quiz/Submit', answers).success(function (data, status) {
            //    alert(data);
            //});
            console.log($scope.questions);
            var u = $firebaseObject(firebase.database().ref().child('users').child($scope.userName));
            u.userName = $scope.userName;
            u.questions = $scope.questions;
            u.score = $scope.totalCorrectAnswers;
            u.feedback = $scope.feedback;
            //$scope.users[$scope.userName].questions = $scope.questions;
            //$scope.users[$scope.userName].score = $scope.totalCorrectAnswers;
            //$scope.users[$scope.userName].feeddback = $scope.feedback;
            u.$save().then(function(result) {
                console.log("Score saved");
            });
        }
    };

    $scope.pageCount = function () {
        return Math.ceil($scope.questions.length / $scope.itemsPerPage);
    };

    //If you wish, you may create a separate factory or service to call loadQuiz. To keep things simple, i have kept it within controller.
    $scope.loadQuiz = function (file) {
        $http.get(file)
         .then(function (res) {
             $scope.quiz = res.data.quiz;
             $scope.config = helper.extend({}, $scope.defaultConfig, res.data.config);

             $scope.itemsPerPage = $scope.config.pageSize;
             $scope.currentPage = 1;
             $scope.questions = helper.getRandom(res.data.questions, $scope.config.totalQuestions);


             //$scope.questions = $scope.config.shuffleQuestions ? helper.shuffle(res.data.questions) : res.data.questions;
             $scope.totalItems = $scope.config.totalQuestions ? $scope.config.totalQuestions : $scope.questions.length;
             $scope.itemsPerPage = $scope.config.pageSize;
             $scope.currentPage = 1;
             $scope.mode = 'quiz';
             if($scope.config.shuffleOptions){
                 $scope.shuffleOptions();
             }

             $scope.$watch('currentPage + itemsPerPage', function () {
                 var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
                   end = begin + $scope.itemsPerPage;

                 $scope.filteredQuestions = $scope.questions.slice(begin, end);
             });
         });
    };
    
    $scope.shuffleOptions = function(){
        $scope.questions.forEach(function (question) {
           question.Options = helper.shuffle(question.Options);
        });
    };
    
    $scope.loadQuiz($scope.quizName);

    $scope.isAnswered = function (index) {
        var answered = 'Not Answered';
        $scope.questions[index].Options.forEach(function (element, index, array) {
            if (element.Selected == true) {
                answered = 'Answered';
                return false;
            }
        });
        return answered;
    };

    $scope.isCorrect = function (question) {
        var result = 'correct';
        question.Options.forEach(function (option, index, array) {
            if (helper.toBool(option.Selected) != option.IsAnswer) {
                result = 'wrong';
                return false;
            }
        });
        return result;
    };

    $scope.finished = function(){
        if(($scope.mode === 'quiz' || $scope.mode === 'review') && !$scope.submitCalled) {
            $scope.timedout = true;
            $timeout(function(){
                $scope.onSubmit();
                $scope.$apply();
            }, 100);
        }
    }
};

quizCtrl.$inject = ['$scope', '$http', '$location', '$rootScope', '$timeout', "$firebaseArray", "$firebaseObject", 'helperService', 'users' ];
app.controller('quizCtrl', quizCtrl);
