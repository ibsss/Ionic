angular.module('emergencyDept', ['ionic', 'ngResource', 'emergencyDept.controllers', 'emergencyDept.services', 'emergencyDept.constants', 'LocalForageModule', 'ionic-timepicker', 'ionic-datepicker', 'ionic-toast'])

.run(function ($ionicPlatform) {

    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }
    });
})

.config(function ($stateProvider, $urlRouterProvider, USER_ROLES) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js

    $stateProvider

    // setup an abstract state for the tabs directive
        .state('login', {
        cache: false,
        url: '/login',
        templateUrl: 'templates/login.html',
        //controller: 'LoginCtrl'
    })

    .state('tab', {
        cache: false,
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
        cache: false,
        url: '/dash',
        views: {
            'tab-dash': {
                templateUrl: 'templates/tab-dash.html',
                //controller: 'DashCtrl'
            }
        }
    })

    .state('tab.patients', {
        cache: false,
        url: '/pats',
        views: {
            'tab-chats': {
                templateUrl: 'templates/tab-patients.html',
                //controller: 'PatientsCtrl'
            }
        }
    })

    .state('tab.patients-vital/:patId', {
        cache: false,
        url: '/pats/vital/:patId',
        views: {
            'tab-chats': {
                templateUrl: 'templates/vital-entry.html',
                //controller: 'PatientsVitalCtrl'
            }
        }
    })

    .state('tab.patients-graph/:patId', {
        cache: false,
        url: '/pats/graph/:patId',
        views: {
            'tab-chats': {
                templateUrl: 'templates/graph-vital.html',
                //controller: 'PatientsGraphCtrl'
            }
        }
    })

    .state('tab.patients-vital/:patId/ews', {
        cache: false,
        url: '/pats/vital/:patId/ews',
        views: {
            'tab-chats': {
                templateUrl: 'templates/EWS.html',
                //controller: 'PatientsGraphCtrl'
            }
        }
    })

    .state('tab.patient-detail/:patId', {
        cache: false,
        url: '/pats/pd/:patId',
        views: {
            'tab-chats': {
                templateUrl: 'templates/patient-detail.html',
                //controller: 'PatientDetailCtrl'
            }
        }
    })

    .state('tab.account', {
        cache: false,
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-account.html',
                //controller: 'AccountCtrl'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.admin]
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

});