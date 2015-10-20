angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $ionicModal, $state, $firebaseAuth, 
  $ionicLoading, $rootScope) {

  console.log('Login controller initialized');

  var ref = new Firebase($scope.firebaseUrl);
  var auth = $firebaseAuth(ref);

  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope
  }).then(function (modal){
    $scope.modal = modal;
  });

  $scope.createUser = function(user){
    console.log('createUser function called');

    if(user && user.email && user.password && user.displayname){

      $ionicLoading.show({
        template:'Signing you up..'
      });

      auth.$createUser({
        email: user.email,
        password: user.password
      }).then(function(userData){
        console.log('user successfully created');

        ref.child("users").child(userData.uid).set({
          email: user.email,
          displayname: user.displayname
        })

        $ionicLoading.hide();
        $scope.modal.hide();

      }).catch(function(error){
        alert("Error: "+error);
        $ionicLoading.hide();
      });
    }else{
      alert("Fill all the details ");
    }    
  }

   $scope.signIn = function (user) {
      if (user && user.email && user.pwdForLogin) {
          $ionicLoading.show({
              template: 'Signing In...'
          });
          auth.$authWithPassword({
              email: user.email,
              password: user.pwdForLogin
          }).then(function (authData) {
              console.log("Logged in as:" + authData.uid);
              ref.child("users").child(authData.uid).once('value', function (snapshot) {
                  var val = snapshot.val();
                  // To Update AngularJS $scope either use $apply or $timeout
                  $scope.$apply(function () {
                      $rootScope.displayName = val;
                  });
              });
              $ionicLoading.hide();
              $state.go('tab.rooms');
          }).catch(function (error) {
              alert("Authentication failed:" + error.message);
              $ionicLoading.hide();
          });
      }else{
          alert("Please enter email and password both");
      }
    }

})

.controller('ChatsCtrl', function($scope, Chats, $state) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  console.log('Chats controller initialized');

   $scope.IM = {
        textMessage: ""
    };

    Chats.selectRoom($state.params.roomId);

    var roomName = Chats.getSelectedRoomName();

    // Fetching Chat Records only if a Room is Selected
    if (roomName) {
      $scope.roomName = " - " + roomName;
      $scope.chats = Chats.all();
    }

    $scope.sendMessage = function (msg) {
      console.log(msg);
      Chats.send($scope.displayName, msg);
      $scope.IM.textMessage = "";
    }

  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('RoomsCtrl', function($scope, Rooms, Chats, $state) {
  console.log('Rooms controller initialized');

  $scope.rooms = Rooms.all();

  $scope.openChatRoom = function (roomId) {
    $state.go('tab.chats', {
        roomId: roomId
    });
  }

});
