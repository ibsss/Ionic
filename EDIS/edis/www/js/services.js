angular.module('emergencyDept.services', ['ngResource'])

.constant('URL_ENDPOINT', 'http://localhost:6161/services/EDISWSL/')
    //.constant('URL_ENDPOINT', 'http://192.168.1.115:6161/services/EDISWSL/')

.service('AuthService', function ($q, $http, USER_ROLES, URL_ENDPOINT) {
    var LOCAL_TOKEN_KEY = 'yourTokenKey';
    var username = '';
    var isAuthenticated = false;
    var role = '';
    var authToken;
    var campusCode = '3';

    function loadUserCredentials() {
        var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        if (token) {
            useCredentials(token);
        }
    }

    function storeUserCredentials(userNM, token, roleParam) {
        window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
        useCredentials(userNM, token, roleParam);
    }

    function useCredentials(userNM, token, roleParam) {
        username = userNM;
        isAuthenticated = true;
        authToken = token;
        role = roleParam;

        //        if (username == 'admin') {
        //            role = USER_ROLES.admin
        //        }
        //        if (username == 'user') {
        //            role = USER_ROLES.public
        //        }

        // Set the token as header for your requests!
        $http.defaults.headers.common['X-Auth-Token'] = token;
    }

    function destroyUserCredentials() {
        authToken = undefined;
        username = '';
        isAuthenticated = false;
        $http.defaults.headers.common['X-Auth-Token'] = undefined;
        window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

    function fetchToken(username, password) {
        var myPromise = $q.defer();

        $http.get(URL_ENDPOINT + 'get?data=token?' + username + '?' + password).then(function (response) {
                var x2js = new X2JS();
                tokenData = x2js.xml_str2json(response.data);
                console.log(JSON.stringify(tokenData));
                if (tokenData.data.userToken) {
                    myPromise.resolve(tokenData.data.userToken);
                } else {
                    myPromise.reject('Login Failed.');
                }
            },
            myPromise.reject);
        return myPromise.promise;
    }

    function releaseToken(username) {
        var myPromise = $q.defer();
        console.log("logging out " + username);
        $http.get(URL_ENDPOINT + 'get?data=logout?' + username).then(function (response) {
                console.log(response);
                myPromise.resolve('Released.');
            },
            myPromise.reject);
        return myPromise.promise;
    }

    var login = function (name, pw) {
        return $q(function (resolve, reject) {
            fetchToken(name, pw).then(function (response) {
                console.log(JSON.stringify(response));
                storeUserCredentials(response._username, response._token, response._role);
                resolve('Login success');
            }, function (response) {
                reject('Login Failed.');
            });
        });
    };

    var logout = function () {
        return $q(function (resolve, reject) {
            if (username) {
                releaseToken(username).then(function (response) {
                    destroyUserCredentials();
                    resolve('Released');
                }, function (response) {
                    destroyUserCredentials();
                    reject('Release Failed.');
                });
            }
        });
    };

    var isAuthorized = function (authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }
        return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
    };

    loadUserCredentials();

    return {
        login: login,
        logout: logout,
        isAuthorized: isAuthorized,
        isAuthenticated: function () {
            return isAuthenticated;
        },
        getUsername: function () {
            console.log("username - " + username);
            return username;
        },
        getToken: function () {
            console.log("token - " + authToken);
            return authToken;
        },
        getCampus: function () {
            console.log("campus - " + campusCode);
            return campusCode;
        },
        role: function () {
            console.log("role -  " + role);
            return role;
        },

    };
})

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
    return {
        responseError: function (response) {
            $rootScope.$broadcast({
                401: AUTH_EVENTS.notAuthenticated,
                403: AUTH_EVENTS.notAuthorized
            }[response.status], response);
            return $q.reject(response);
        }
    };
})

.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
})

.directive('formattedTime', function ($filter) {

    return {
        require: '?ngModel',
        link: function (scope, elem, attr, ngModel) {
            if (!ngModel)
                return;
            if (attr.type !== 'time')
                return;

            ngModel.$formatters.unshift(function (value) {
                // Replace the seconds & ms like :23.298 with nothing
                return value.replace(/:[0-9]+.[0-9]+$/, '');
            });
        }
    };

})

.directive('standardTimeMeridian', function () {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            etime: '=etime'
        },
        template: "<normal>{{stime}}</normal>",
        link: function (scope, elem, attrs) {

            scope.stime = epochParser(scope.etime, 'time');

            function prependZero(param) {
                if (String(param).length < 2) {
                    return "0" + String(param);
                }
                return param;
            }

            function epochParser(val, opType) {
                if (val === null) {
                    return "00:00";
                } else {
                    var meridian = ['AM', 'PM'];

                    if (opType === 'time') {
                        var hours = parseInt(val / 3600);
                        var minutes = (val / 60) % 60;
                        var hoursRes = hours > 12 ? (hours - 12) : hours;

                        var currentMeridian = meridian[parseInt(hours / 12)];

                        return (prependZero(hoursRes) + ":" + prependZero(minutes) + " " + currentMeridian);
                    }
                }
            }

            scope.$watch('etime', function (newValue, oldValue) {
                scope.stime = epochParser(scope.etime, 'time');
            });

        }
    };
})

.filter("jsDate", function () {
    return function (x) {
        if (!x) return null;
        return new Date(parseInt(x.substr(6)));
    };
})

.filter('titleCase', function () {
    return function (input) {
        input = input || '';
        return input.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };
})

.filter('truncate', function () {
    return function (text, length, end) {

        if (text == null)
            return "";

        if (isNaN(length))
            length = 10;

        if (end === undefined)
            end = "...";

        if (text.length <= length || text.length - end.length <= length) {
            return text;
        } else {
            return String(text).substring(0, length - end.length) + end;
        }
    };
})

.service('patientServices', function ($http, $q, URL_ENDPOINT, AuthService, $ionicPopup, $state) {

    var PatientDetails = {};
    var AllPatients;
    var currentPatient = '';
    var campusCode = '';
    var currentUser = '';
    var currentToken = '';
    var currentRole = '';

    return {
        currentPatient: function () {
            return currentPatient;
        },
        AllPatients: function () {
            var myPromise = $q.defer();
            myPromise.resolve(AllPatients);
            return myPromise.promise;
        },
        PatientDetails: function () {
            var myPromise = $q.defer();
            myPromise.resolve(PatientDetails);
            return myPromise.promise;
        },
        reset: function () {
            PatientDetails.length = 0;
        },

        //        myPromise.reject('Login Failed.');
        //        return myPromise.promise;
        //
        //        if ((username == 'admin' && password == '1') || (username == 'user' && password == '1')) {
        //            // Make a request and receive your auth token from your server
        //            myPromise.resolve('token123');
        //        } else {
        //            myPromise.reject('Login Failed.');
        //        }
        //
        //        return myPromise.promise;    },
        getAll: function () {
            var myPromise = $q.defer();

            campusCode = AuthService.getCampus();
            currentUser = AuthService.getUsername();
            currentToken = AuthService.getToken();
            currentRole = AuthService.role();

            //$http.defaults.headers.common.Authorization = "Basic dXNlcjpwYXNzd29yZA==";
            $http.get(URL_ENDPOINT + 'get?data=patients?' + campusCode + '?' + currentUser + '?' + currentToken).then(function (response) {
                    var x2js = new X2JS();
                    AllPatients = x2js.xml_str2json(response.data);
                    console.log("getting all patients");
                    //console.log(JSON.stringify(AllPatients));

                    if (AllPatients.data.errorData) {
                        myPromise.reject("timeout");
                    } else {
                        myPromise.resolve(AllPatients);
                    }

                },
                myPromise.reject);
            return myPromise.promise;
        },
        //        search: function (searchTerm) {
        //            var myPromise = $q.defer();
        //
        //            //$http.defaults.headers.common.Authorization = "Basic dXNlcjpwYXNzd29yZA==";
        //            $http.get(URL_ENDPOINT + 'get?data=patients?3').then(function (response) {
        //                    //console.log(JSON.stringify(response.data));
        //                    var x2js = new X2JS();
        //                    myPromise.resolve(x2js.xml_str2json(response.data));
        //                },
        //                myPromise.reject);
        //            return myPromise.promise;
        //        },
        //        setPatient: function (data) {
        //            PatientDetails = data;
        //        },
        getPatient: function (patId) {
            var myPromise = $q.defer();

            campusCode = AuthService.getCampus();
            currentUser = AuthService.getUsername();
            currentToken = AuthService.getToken();

            if (PatientDetails._internalId == patId) {
                console.log("returning patient details from memory " + JSON.stringify(PatientDetails));
                myPromise.resolve(PatientDetails);
                return myPromise.promise;
            }

            $http.defaults.headers.common.Authorization = "Basic dXNlcjpwYXNzd29yZA==";
            $http.get(URL_ENDPOINT + 'get?data=details?' + campusCode + '?' + currentUser + '?' + currentToken + '?' + patId).then(function (response) {
                    var x2js = new X2JS;
                    returnData = x2js.xml_str2json(response.data);
                    console.log("getting patient details");

                    //console.log(JSON.stringify(returnData));

                    if (returnData.data.errorData) {
                        myPromise.reject("timeout");
                    } else {
                        PatientDetails = returnData.data.patientData;
                        myPromise.resolve(PatientDetails);
                    }
                },
                myPromise.reject);
            return myPromise.promise;
        },
        getVitals: function (patId) {
            var myPromise = $q.defer();

            campusCode = AuthService.getCampus();
            currentUser = AuthService.getUsername();
            currentToken = AuthService.getToken();

            $http.get(URL_ENDPOINT + 'get?data=vitals?' + campusCode + '?' + currentUser + '?' + currentToken + '?' + patId).then(function (response) {
                    var x2js = new X2JS;
                    //console.log(x2js.xml_str2json(response.data));
                    returnDetails = x2js.xml_str2json(response.data);
                    myPromise.resolve(returnDetails.data);
                },
                myPromise.reject);
            return myPromise.promise;
        },
        recordVitals: function (patId, vitalDT, temperature, pulse, resps, sysbp, diabp) {
            var myPromise = $q.defer();

            campusCode = AuthService.getCampus();
            currentUser = AuthService.getUsername();
            currentToken = AuthService.getToken();

            $http.get(URL_ENDPOINT + 'get?data=updateVitals?' + campusCode + '?' + currentUser + '?' + currentToken + '?' + patId + '?' + vitalDT + '?' + temperature + '?' + pulse + '?' + resps + '?' + sysbp + '?' + diabp).then(function (response) {
                    var x2js = new X2JS;
                    //console.log(x2js.xml_str2json(response.data));
                    returnDetails = x2js.xml_str2json(response.data);
                    myPromise.resolve(returnDetails.data);
                },
                myPromise.reject);
            return myPromise.promise;

        }
    }
})