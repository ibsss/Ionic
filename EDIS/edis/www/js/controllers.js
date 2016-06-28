'use strict';

angular.module('emergencyDept.controllers', ['tc.chartjs'])

.controller('AppCtrl', function ($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {

    $scope.username = AuthService.getUsername();

    $scope.$on(AUTH_EVENTS.notAuthorized, function (event) {
        var alertPopup = $ionicPopup.alert({
            title: 'Unauthorized!',
            template: 'You are not allowed to access this resource.'
        });
    });

    $scope.$on(AUTH_EVENTS.notAuthenticated, function (event) {
        AuthService.logout();
        $state.go('login');
        var alertPopup = $ionicPopup.alert({
            title: 'Session Lost!',
            template: 'Sorry, You have to login again.'
        });
    });

    $scope.setCurrentUsername = function (name) {
        $scope.username = name;
    };
})

.controller('DashCtrl', function ($scope, patientServices, $ionicLoading, $timeout, $state, AuthService) {

    var _this = this;
    var anim_count = 0;

    _this.temperatureChart;
    _this.pulseChart;
    _this.offline = true;
    _this.refreshDT = null;

    $scope.username = AuthService.getUsername();

    //    _this.updateChart = function (data) {
    //        for (var i = 0; i < data.length; i++) {
    //            switch (data[i].AllergyStatus) {
    //            case "Allergy Status UnKnown":
    //                unknown++;
    //                break;
    //            case "Allergies Known and Recorded":
    //                known++;
    //                break;
    //            case "No Known Allergies":
    //                noallergies++;
    //                break;
    //            }
    //        }
    //
    //        _this.data[0].value = unknown;
    //        _this.data[1].value = known;
    //        _this.data[2].value = noallergies;
    //    };

    $scope.logout = function () {
        AuthService.logout();
        $state.go('login');
    };

    _this.loadChart = function () {
        _this.tempData = {
            labels: ['9 Nov 2015 23:40', '9 Nov 2015 23:59', '10 Nov 2015 00:15', '10 Nov 2015 01:45', '10 Nov 2015 09:05'],
            datasets: [
                {
                    label: 'Temperature',
                    fillColor: 'rgba(220,220,220,0.2)',
                    strokeColor: 'rgba(220,220,220,1)',
                    pointColor: 'rgba(220,220,220,1)',
                    pointStrokeColor: '#fff',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(220,220,220,1)',
                    data: [36.1, 36.4, 37.0, 37.8, 39]
                }
            ]
        };
        _this.pulseData = {
            labels: ['9 Nov 2015 23:40', '9 Nov 2015 23:59', '10 Nov 2015 00:15', '10 Nov 2015 01:45', '10 Nov 2015 09:05'],
            datasets: [
                {
                    label: 'Pulse',
                    fillColor: 'rgba(220,20,220,0.2)',
                    strokeColor: 'rgba(220,20,220,1)',
                    pointColor: 'rgba(220,20,220,1)',
                    pointStrokeColor: '#fff',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(220,20,220,1)',
                    data: [50, 36, 47.0, 57.8, 69]
                }
            ]
        };
    };


    // Chart.js Options
    _this.Options = {
        responsive: true,
        segmentShowStroke: true,
        segmentStrokeColor: '#fff',
        segmentStrokeWidth: 2,
        percentageInnerCutout: 50, // This is 0 for Pie charts
        animationSteps: 100,
        animationEasing: 'easeOutBounce',
        animateRotate: true,
        animateScale: true,
    };

    $scope.doRefresh = function () {
        data = _this.loadChart();
        $scope.$broadcast('scroll.refreshComplete');
    };

    var data = _this.loadChart();
})

.controller('PatientsCtrl', function ($scope, $state, patientServices, AuthService, $ionicPopup) {

    var _this = this;
    _this.offline = true;
    _this.refreshDT = null;

    $scope.username = AuthService.getUsername();

    $scope.timeout = function () {
        if ($scope.username != '') {

            var alertPopup = $ionicPopup.alert({
                title: 'Session Lost!',
                template: 'Sorry, You have to login again.'
            });
            $scope.logout();
            $scope.username = '';
        }
    };

    $scope.logout = function () {
        AuthService.logout();
        $state.go('login');
    };

    //var data = patientServices.getAll().then(function (response) {
    _this.loadPatients = function () {
        patientServices.reset();

        var data = patientServices.getAll("BB2").then(function (response) {
            //console.log(JSON.stringify(response));

            _this.patients = response.data.patList;
            _this.offline = false;
            //            $localForage.setItem('deptPatients', response).then(function () {
            //                _this.refreshDT = new Date();
            //                $localForage.setItem('deptDT', _this.refreshDT);
            //            });
        }, function (response) {

            console.log("rejected patient list");
            $scope.timeout();
            _this.offline = true;
            //            $localForage.getItem('deptPatients').then(function (response) {
            //                _this.patients = response.data.patList;
            //            });
            //
            //            $localForage.getItem('deptDT').then(function (response) {
            //                _this.refreshDT = response;
            //            });
        });
    };

    $scope.doRefresh = function () {
        data = _this.loadPatients();
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.clickPatient = function (item) {
        console.log(JSON.stringify(item));
        $state.go('tab.patient-detail/:patId', {
            patId: item
        }, {
            reload: false
        });
    };

    var data = _this.loadPatients();
})

.controller('PatientDetailCtrl', function ($scope, $state, $stateParams, patientServices, AuthService, $ionicPopup) {

    var _this = this;
    _this.offline = true;
    _this.refreshDT = null;
    _this.loaded = true;

    var genderMap = {
        M: "patientBannerMale",
        F: "patientBannerFemale"
    };

    $scope.username = AuthService.getUsername();

    $scope.timeout = function () {
        if ($scope.username != '') {

            var alertPopup = $ionicPopup.alert({
                title: 'Session Lost!',
                template: 'Sorry, You have to login again.'
            });
            $scope.logout();
            $scope.username = '';
        }
    };

    $scope.logout = function () {
        AuthService.logout();
        $state.go('login');
    };

    //console.log("patient details " + JSON.stringify($stateParams));
    _this.loadDetails = function () {
        var data = patientServices.getPatient($stateParams.patId).then(function (response) {
            //console.log(JSON.stringify(response));
            _this.patientDetail = response;
            _this.offline = false;
            //            $localForage.setItem('patDetails' + $stateParams.patId, response).then(function () {
            //                _this.refreshDT = new Date();
            //                $localForage.setItem('patDetailsDT' + $stateParams.patId, _this.refreshDT);
            //            });
        }, function (response) {
            console.log("rejected patient details");
            $scope.timeout();
            _this.offline = true;
            //            $localForage.getItem('patDetails' + $stateParams.patId).then(function (response) {
            //                _this.patientDetail = response;
            //                //console.log(JSON.stringify(response));
            //                if (response == null) {
            //                    _this.loaded = false;
            //                }
            //            }, function (response) {
            //                console.log("not available");
            //                _this.loaded = false;
            //            });
            //
            //            $localForage.getItem('patDetailsDT' + $stateParams.patId).then(function (response) {
            //                _this.refreshDT = response;
            //            });
        });
    };

    $scope.patientGender = function (item) {
        if (!item) return "patientBannerUnknown";
        if (!item.patient) return "patientBannerUnknown";
        if (!item.patient._Sex) return "patientBannerUnknown";
        if (item.patient._Sex !== "M" && item.patient._Sex !== "F") {
            return "patientBannerUnknown";
        }

        return genderMap[item.patient._Sex];
    };

    _this.openingDate = function (item) {
        return -parseInt(item.OpenedOn.substr(6));
    };

    $scope.closeDetails = function (item) {

        //console.log(JSON.stringify(item));
        $state.go('tab.patients', {}, {
            reload: false
        });
    };

    $scope.recordVitals = function (item) {

        //console.log(JSON.stringify(item));
        $state.go('tab.patients-vital/:patId', {
            patId: item
        }, {
            reload: false
        });
    };

    $scope.graphVitals = function (item) {

        //console.log(JSON.stringify(item));
        $state.go('tab.patients-graph/:patId', {
            patId: item
        }, {
            reload: false
        });
    };

    $scope.doRefresh = function () {
        data = _this.loadDetails();
        $scope.$broadcast('scroll.refreshComplete');
    };

    var data = _this.loadDetails();
})

.controller('PatientsVitalCtrl', function ($scope, $state, $stateParams, patientServices, $localForage, ionicToast, $timeout, $ionicPopup, AuthService) {

    var _this = this;
    _this.offline = true;
    _this.refreshDT = null;
    _this.loaded = true;

    var genderMap = {
        M: "patientBannerMale",
        F: "patientBannerFemale"
    };

    $scope.username = AuthService.getUsername();

    $scope.timeout = function () {
        if ($scope.username != '') {

            var alertPopup = $ionicPopup.alert({
                title: 'Session Lost!',
                template: 'Sorry, You have to login again.'
            });
            $scope.logout();
            $scope.username = '';
        }
    };

    $scope.logout = function () {
        AuthService.logout();
        $state.go('login');
    };

    $scope.disableSubmit = true;

    $scope.patientGender = function (item) {
        if (!item) return "patientBannerUnknown";
        if (!item.patient) return "patientBannerUnknown";
        if (!item.patient._Sex) return "patientBannerUnknown";
        if (item.patient._Sex !== "M" && item.patient._Sex !== "F") {
            return "patientBannerUnknown";
        }

        return genderMap[item.patient._Sex];
    };

    _this.loadVitals = function () {
        var data = patientServices.getPatient($stateParams.patId).then(function (response) {
            //console.log("Controller " + JSON.stringify(response));
            _this.vitalsDetail = response;
            $scope.populateValues(response);
            _this.offline = false;
            //            $localForage.setItem('patDetails' + $stateParams.patId, response).then(function () {
            //                _this.refreshDT = new Date();
            //                $localForage.setItem('patDetailsDT' + $stateParams.patId, _this.refreshDT);
            //            });
        }, function (response) {
            console.log("rejected patient vitals");
            $scope.timeout();
            _this.offline = true;
            //            $localForage.getItem('patDetails' + $stateParams.patId).then(function (response) {
            //                _this.vitalsDetail = response;
            //            });
            //
            //            $localForage.getItem('patDetailsDT' + $stateParams.patId).then(function (response) {
            //                _this.refreshDT = response;
            //            });        
        });
    };

    var monthList = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

    $scope.datepickerObject = {
        todayLabel: 'Today', //Optional
        closeLabel: 'Close', //Optional
        setLabel: 'Set', //Optional
        inputDate: new Date(), //Optional
        mondayFirst: true, //Optional
        templateType: 'popup', //Optional
        showTodayButton: 'true', //Optional
        modalHeaderColor: 'bar-positive', //Optional
        modalFooterColor: 'bar-positive', //Optional
        monthList: monthList,
        callback: function (val) { //Mandatory
            datePickerCallback(val);
        },
        to: new Date(),
        dateFormat: 'dd-MMM-yyyy', //Optional
        closeOnSelect: false, //Optional
    };

    $scope.timePickerObject = {
        inputEpochTime: ((new Date()).getHours() * 60 * 60), //Optional
        step: 5, //Optional
        format: 24, //Optional
        setLabel: 'Set', //Optional
        closeLabel: 'Close', //Optional
        callback: function (val) { //Mandatory
            timePickerCallback(val);
        }
    };

    $scope.changeField = function () {
        $scope.disableSubmit = false;
    };

    var datePickerCallback = function (val) {
        if (typeof (val) === 'undefined') {
            console.log('No date selected');
        } else {
            //console.log('Selected date is : ', val)
            $scope.datepickerObject.inputDate = val;
            $scope.disableSubmit = false;
        }
    };

    var timePickerCallback = function timePickerCallback(val) {
        if (typeof (val) === 'undefined') {
            console.log('Time not selected');
        } else {
            var selectedTime = new Date(val * 1000);
            //console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
            $scope.timePickerObject.inputEpochTime = val;
            $scope.disableSubmit = false;
            $scope.vitalTime = selectedTime.getHours + ":" + selectedTime.getMinutes;
        }
    }

    $scope.populateValues = function (data) {

        $scope.personId = data.patient._internalId;
        var coeff = 1000 * 60 * 5;
        var date = new Date();
        $scope.vitalTime = new Date(Math.floor(date.getTime() / coeff) * coeff);
        $scope.timePickerObject.inputEpochTime = $scope.vitalTime.getHours() * 60 * 60 + ($scope.vitalTime.getMinutes() * 60);

        $scope.temperature = {};
        $scope.pulse = {};
        $scope.resp = {};
        $scope.sys = {};
        $scope.dia = {};

        if (data.Vitals) {
            _this.temperature = data.Vitals._Temperature;
            $scope.temperature.Value = _this.temperature;
            _this.pulse = data.Vitals._Pulse;
            $scope.pulse.Value = _this.pulse;
            _this.resp = data.Vitals._RespRate;
            $scope.resp.Value = _this.resp;
            _this.sys = data.Vitals._SysBP;
            $scope.sys.Value = _this.sys;
            _this.dia = data.Vitals._DiaBP;
            $scope.dia.Value = _this.dia;
        } else {
            _this.temperature = 37.0;
            $scope.temperature.Value = _this.temperature;
            _this.pulse = 72;
            $scope.pulse.Value = _this.pulse;
            _this.resp = 20;
            $scope.resp.Value = _this.resp;
            _this.sys = 120;
            $scope.sys.Value = _this.sys;
            _this.dia = 70;
            $scope.dia.Value = _this.dia;
        }
    };

    $scope.enterTemperature = function () {
        // An elaborate, custom popup
        $scope.temperature.Value = Number($scope.temperature.Value);
        var myPopup = $ionicPopup.show({
            template: '<input type="number" min="20" max="45" ng-model="temperature.Value">',
            title: 'Temperature',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (!$scope.temperature.Value) {
                            e.preventDefault();
                        } else {
                            $scope.disableSubmit = false;
                            return $scope.temperature.Value;
                        }
                    }
       },
     ]
        });
    };

    $scope.enterPulse = function () {
        // An elaborate, custom popup
        $scope.pulse.Value = Number($scope.pulse.Value);
        var myPopup = $ionicPopup.show({
            template: '<input type="number" min="1" max="300" ng-model="pulse.Value">',
            title: 'Pulse',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (!$scope.pulse.Value) {
                            e.preventDefault();
                        } else {
                            $scope.disableSubmit = false;
                            return $scope.pulse.Value;
                        }
                    }
       },
     ]
        });
    };

    $scope.enterResp = function () {
        // An elaborate, custom popup
        $scope.resp.Value = Number($scope.resp.Value);
        var myPopup = $ionicPopup.show({
            template: '<input type="number" min="1" max="99" ng-model="resp.Value">',
            title: 'Respiratory',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (!$scope.resp.Value) {
                            e.preventDefault();
                        } else {
                            $scope.disableSubmit = false;
                            return $scope.resp.Value;
                        }
                    }
       },
     ]
        });
    };

    $scope.enterSys = function () {
        // An elaborate, custom popup
        $scope.sys.Value = Number($scope.sys.Value);
        var myPopup = $ionicPopup.show({
            template: '<input type="number" min="1" max="300" ng-model="sys.Value">',
            title: 'Systolic',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (!$scope.sys.Value) {
                            e.preventDefault();
                        } else {
                            $scope.disableSubmit = false;
                            return $scope.sys.Value;
                        }
                    }
       },
     ]
        });
    };

    $scope.enterDia = function () {
        // An elaborate, custom popup
        $scope.dia.Value = Number($scope.dia.Value);
        var myPopup = $ionicPopup.show({
            template: '<input type="number" min="1" max="200" ng-model="dia.Value">',
            title: 'Diastolic',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (!$scope.dia.Value) {
                            e.preventDefault();
                        } else {
                            $scope.disableSubmit = false;
                            return $scope.dia.Value;
                        }
                    }
       },
     ]
        });
    };

    $scope.cancelVitals = function (item) {
        $state.go('tab.patient-detail/:patId', {
            patId: item
        }, {
            reload: false
        });
    };

    $scope.recordVitals = function (item) {

        $scope.vitalTime = $scope.timePickerObject.inputEpochTime;
        var hours = Math.floor($scope.vitalTime / 3600);
        var totalSeconds = $scope.vitalTime % 3600;
        var minutes = Math.floor(totalSeconds / 60);

        $scope.vitalDate = $scope.datepickerObject.inputDate;
        $scope.vitalDate.setHours(hours);
        $scope.vitalDate.setMinutes(minutes);
        $scope.vitalDate.setSeconds(0);
        $scope.vitalDate.setMilliseconds(0);
        $scope.vitalDate = $scope.vitalDate.toISOString();

        //        console.log($scope.personId);
        //        console.log($scope.temperature.Value);
        //        console.log($scope.pulse.Value);
        //        console.log($scope.resp.Value);
        //        console.log($scope.dia.Value);
        //        console.log($scope.sys.Value);
        //        console.log($scope.vitalDate);

        $scope.data = {};

        var confirmPopup = $ionicPopup.show({
            template: '<input type="password" pattern="[0-9]*" ng-model="data.PinNumber">',
            title: 'Record Vitals',
            subTitle: 'Enter PIN and click SUBMIT',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: '<b>Submit</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (!$scope.data.PinNumber) {
                            //don't allow the user to close unless he enters wifi password
                            e.preventDefault();
                        } else {
                            return $scope.data.PinNumber;
                        }
                    }
                },
                ]
        });


        //        var confirmPopup = $ionicPopup.confirm({
        //            title: 'Record Vitals',
        //            template: 'Are these values correct?'
        //        });

        confirmPopup.then(function (res) {
            if (res) {
                console.log('You are sure');
                var data = patientServices.recordVitals($scope.personId, $scope.vitalDate, $scope.temperature.Value, $scope.pulse.Value, $scope.resp.Value, $scope.sys.Value, $scope.dia.Value).then(function (response) {
                    console.log(JSON.stringify(response));
                    _this.vitalsDetail = response;

                    ionicToast.show("Vitals Saved", "bottom", false, 5000);

                }, function (response) {
                    console.log("rejected patient vitals");
                });

                $state.go('tab.patients-vital/:patId/ews', {
                    patId: item
                }, {
                    reload: false
                });

            } else {
                console.log('You are not sure');
            }
        });

    };

    var data = _this.loadVitals();
})

.controller('PatientsGraphCtrl', function ($scope, $state, $stateParams, patientServices, $localForage, ionicToast, $timeout, $ionicPopup, AuthService) {

    var _this = this;
    _this.offline = true;
    _this.refreshDT = null;
    _this.loaded = true;

    var genderMap = {
        M: "patientBannerMale",
        F: "patientBannerFemale"
    };

    $scope.username = AuthService.getUsername();

    $scope.timeout = function () {
        if ($scope.username != '') {

            var alertPopup = $ionicPopup.alert({
                title: 'Session Lost!',
                template: 'Sorry, You have to login again.'
            });
            $scope.logout();
            $scope.username = '';
        }
    };

    $scope.logout = function () {
        AuthService.logout();
        $state.go('login');
    };

    $scope.disableSubmit = true;

    $scope.patientGender = function (item) {
        if (!item) return "patientBannerUnknown";
        if (!item.patient) return "patientBannerUnknown";
        if (!item.patient._Sex) return "patientBannerUnknown";
        if (item.patient._Sex !== "M" && item.patient._Sex !== "F") {
            return "patientBannerUnknown";
        }

        return genderMap[item.patient._Sex];
    };

    _this.loadVitals = function () {
        var data = patientServices.getPatient($stateParams.patId).then(function (response) {
            //console.log(JSON.stringify(response));
            _this.vitalsPatDetail = response;
            _this.offline = false;
        }, function (response) {
            console.log("rejected patient details in vitals");
            $scope.timeout();
            _this.offline = true;
        });

        var data = patientServices.getVitals($stateParams.patId).then(function (response) {
            //console.log(JSON.stringify(response));
            _this.vitalsDetail = response;
            _this.loadChart();
            _this.offline = false;
            //            $localForage.setItem('patDetails' + $stateParams.patId, response).then(function () {
            //                _this.refreshDT = new Date();
            //                $localForage.setItem('patDetailsDT' + $stateParams.patId, _this.refreshDT);
            //            });        
        }, function (response) {
            console.log("rejected patient vitals");
            _this.offline = true;
            //            $localForage.getItem('patDetails' + $stateParams.patId).then(function (response) {
            //                _this.vitalsDetail = response;
            //            });
            //
            //            $localForage.getItem('patDetailsDT' + $stateParams.patId).then(function (response) {
            //                _this.refreshDT = response;
            //            });
        });
    };

    $scope.cancelVitals = function (item) {
        $state.go('tab.patient-detail/:patId', {
            patId: item
        }, {
            reload: false
        });
    };

    _this.loadChart = function () {
        _this.tempData = {
            labels: [],
            datasets: [
                {
                    label: 'Temperature',
                    fillColor: 'rgba(40,255,40,0.2)',
                    strokeColor: 'rgba(40,255,40,1)',
                    pointColor: 'rgba(40,255,40,1)',
                    pointStrokeColor: '#fff',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(40,255,40,1)',
                    data: []
                }
            ]
        };
        _this.pulseData = {
            labels: [],
            datasets: [
                {
                    label: 'Pulse',
                    fillColor: 'rgba(255,40,40,0.2)',
                    strokeColor: 'rgba(255,40,40,1)',
                    pointColor: 'rgba(255,40,40,1)',
                    pointStrokeColor: '#fff',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(255,40,40,1)',
                    data: []
                }
            ]
        };
        _this.respData = {
            labels: [],
            datasets: [
                {
                    label: 'Respiratory Rate',
                    fillColor: 'rgba(40,40,255,0.2)',
                    strokeColor: 'rgba(40,40,255,1)',
                    pointColor: 'rgba(40,40,255,1)',
                    pointStrokeColor: '#fff',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(40,40,255,1)',
                    data: []
                }
            ]
        };
        _this.BPData = {
            labels: [],
            datasets: [
                {
                    label: 'Systolic',
                    fillColor: 'rgba(40,255,40,0.2)',
                    strokeColor: 'rgba(40,255,40,1)',
                    pointColor: 'rgba(40,255,40,1)',
                    pointStrokeColor: '#fff',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(40,255,40,1)',
                    data: []
                },
                {
                    label: 'Diastolic',
                    fillColor: 'rgba(255,0,0,0.2)',
                    strokeColor: 'rgba(255,0,0,1)',
                    pointColor: 'rgba(255,0,0,1)',
                    pointStrokeColor: '#fff',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(120,120,120,1)',
                    data: []
                }
            ]
        };

        if (_this.vitalsDetail.vitalList.length) {
            var startPoint = 0;
            if (_this.vitalsDetail.vitalList.length > 9) {
                startPoint = _this.vitalsDetail.length - 8;
            }

            //console.log(_this.vitalsDetail.vitalList.length);

            var hoursMins;

            for (var i = startPoint; i < _this.vitalsDetail.vitalList.length; i++) {
                hoursMins = _this.vitalsDetail.vitalList[i]._VitalDateTime;
                hoursMins = hoursMins.split('T')[1];
                hoursMins = hoursMins.split(':')[0] + ':' + hoursMins.split(':')[1];
                _this.tempData.labels.push(hoursMins);
                _this.pulseData.labels.push(hoursMins);
                _this.respData.labels.push(hoursMins);
                _this.BPData.labels.push(hoursMins);
                _this.tempData.datasets[0].data.push(_this.vitalsDetail.vitalList[i]._Temperature);
                _this.pulseData.datasets[0].data.push(_this.vitalsDetail.vitalList[i]._Pulse);
                _this.respData.datasets[0].data.push(_this.vitalsDetail.vitalList[i]._RespRate);
                _this.BPData.datasets[0].data.push(_this.vitalsDetail.vitalList[i]._SysBP);
                _this.BPData.datasets[1].data.push(_this.vitalsDetail.vitalList[i]._DiaBP);
                //                console.log(hoursMins);
                //                console.log(_this.vitalsDetail.vitalList[i]._Temperature);
                //                console.log(_this.vitalsDetail.vitalList[i]._Pulse);
                //                console.log(_this.vitalsDetail.vitalList[i]._RespRate);
                //                console.log(_this.vitalsDetail.vitalList[i]._SysBP);
                //                console.log(_this.vitalsDetail.vitalList[i]._DiaBP);
            }
        } else {
            hoursMins = _this.vitalsDetail.vitalList._VitalDateTime;
            hoursMins = hoursMins.split('T')[1];
            hoursMins = hoursMins.split(':')[0] + ':' + hoursMins.split(':')[1];
            _this.tempData.labels.push(hoursMins);
            _this.pulseData.labels.push(hoursMins);
            _this.respData.labels.push(hoursMins);
            _this.BPData.labels.push(hoursMins);
            _this.tempData.datasets[0].data.push(_this.vitalsDetail.vitalList._Temperature);
            _this.pulseData.datasets[0].data.push(_this.vitalsDetail.vitalList._Pulse);
            _this.respData.datasets[0].data.push(_this.vitalsDetail.vitalList._RespRate);
            _this.BPData.datasets[0].data.push(_this.vitalsDetail.vitalList._SysBP);
            _this.BPData.datasets[1].data.push(_this.vitalsDetail.vitalList._DiaBP);
        }

    };

    // Chart.js Options
    _this.tempOptions = {
        responsive: true,
        segmentShowStroke: true,
        segmentStrokeColor: '#fff',
        segmentStrokeWidth: 2,
        percentageInnerCutout: 50, // This is 0 for Pie charts
        animationSteps: 100,
        animationEasing: 'easeOutBounce',
        animateRotate: true,
        animateScale: true,
        legendTemplate: '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
        scaleStartValue: 20
    };

    _this.pulseOptions = {
        responsive: true,
        segmentShowStroke: true,
        segmentStrokeColor: '#fff',
        segmentStrokeWidth: 2,
        percentageInnerCutout: 50, // This is 0 for Pie charts
        animationSteps: 100,
        animationEasing: 'easeOutBounce',
        animateRotate: true,
        animateScale: true,
        legendTemplate: '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
    };

    _this.respOptions = {
        responsive: true,
        segmentShowStroke: true,
        segmentStrokeColor: '#fff',
        segmentStrokeWidth: 2,
        percentageInnerCutout: 50, // This is 0 for Pie charts
        animationSteps: 100,
        animationEasing: 'easeOutBounce',
        animateRotate: true,
        animateScale: true,
        legendTemplate: '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
    };

    _this.BPOptions = {
        responsive: true,
        segmentShowStroke: true,
        segmentStrokeColor: '#fff',
        segmentStrokeWidth: 2,
        percentageInnerCutout: 50, // This is 0 for Pie charts
        animationSteps: 100,
        animationEasing: 'easeOutBounce',
        animateRotate: true,
        animateScale: true,
        legendTemplate: '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
    };

    $scope.doRefresh = function () {
        data = _this.loadChart();
        $scope.$broadcast('scroll.refreshComplete');
    };

    var data = _this.loadVitals();
})

.controller('PatientsEWSCtrl', function ($scope, $state, $stateParams, patientServices, $localForage, ionicToast, $timeout, $ionicPopup, AuthService) {

    var _this = this;
    _this.offline = true;
    _this.refreshDT = null;
    _this.loaded = true;
    _this.totalScore;
    _this.indScore;

    var genderMap = {
        M: "patientBannerMale",
        F: "patientBannerFemale"
    };

    $scope.username = AuthService.getUsername();

    $scope.timeout = function () {
        if ($scope.username != '') {

            var alertPopup = $ionicPopup.alert({
                title: 'Session Lost!',
                template: 'Sorry, You have to login again.'
            });
            $scope.logout();
            $scope.username = '';
        }
    };

    $scope.logout = function () {
        AuthService.logout();
        $state.go('login');
    };

    $scope.disableSubmit = true;

    $scope.patientGender = function (item) {
        if (!item) return "patientBannerUnknown";
        if (!item.patient) return "patientBannerUnknown";
        if (!item.patient._Sex) return "patientBannerUnknown";
        if (item.patient._Sex !== "M" && item.patient._Sex !== "F") {
            return "patientBannerUnknown";
        }

        return genderMap[item.patient._Sex];
    };

    _this.calculateEWS = function () {
        var respScore = 0;
        var oxySatScore = 0;
        var tempScore = 0;
        var sysBPScore = 0;
        var pulseScore = 0;

        _this.indScore = 0;

        if (_this.vitalsPatDetail.Vitals._Temperature < 35.1) {
            tempScore = 3;
            _this.indScore = 1;
        } else if (_this.vitalsPatDetail.Vitals._Temperature > 39) {
            tempScore = 2;
        } else if (_this.vitalsPatDetail.Vitals._Temperature < 36.1 || _this.vitalsPatDetail.Vitals._Temperature > 38.0) {
            tempScore = 1;
        }

        if (_this.vitalsPatDetail.Vitals._RespRate < 9 || _this.vitalsPatDetail.Vitals._RespRate > 24) {
            respScore = 3;
            _this.indScore = 1;
        } else if (_this.vitalsPatDetail.Vitals._RespRate > 20) {
            respScore = 2;
        } else if (_this.vitalsPatDetail.Vitals._RespRate < 12) {
            respScore = 1;
        }

        if (_this.vitalsPatDetail.Vitals._SysBP < 91 || _this.vitalsPatDetail.Vitals._SysBP > 219) {
            sysBPScore = 3;
            _this.indScore = 1;
        } else if (_this.vitalsPatDetail.Vitals._SysBP < 101) {
            sysBPScore = 2;
        } else if (_this.vitalsPatDetail.Vitals._SysBP < 111) {
            sysBPScore = 1;
        }

        if (_this.vitalsPatDetail.Vitals._Pulse < 41 || _this.vitalsPatDetail.Vitals._Pulse > 130) {
            pulseScore = 3;
            _this.indScore = 1;
        } else if (_this.vitalsPatDetail.Vitals._Pulse > 110) {
            pulseScore = 2;
        } else if (_this.vitalsPatDetail.Vitals._Pulse < 51 || _this.vitalsPatDetail.Vitals._Pulse > 90) {
            pulseScore = 1;
        }

        _this.totalScore = respScore + oxySatScore + tempScore + sysBPScore + pulseScore;
        console.log("EWS score " + _this.totalScore);
        console.log("temp score " + tempScore);
        console.log("resp score " + respScore);
        console.log("sysbp score " + sysBPScore);
        console.log("pulse score " + pulseScore);
    };

    _this.loadVitals = function () {
        var data = patientServices.getPatient($stateParams.patId).then(function (response) {
            console.log(JSON.stringify(response));
            _this.vitalsPatDetail = response;
            _this.calculateEWS();
            _this.offline = false;
        }, function (response) {
            console.log("rejected patient details in vitals");
            $scope.timeout();
            _this.offline = true;
        });

    };

    $scope.cancelVitals = function (item) {
        $state.go('tab.patient-detail/:patId', {
            patId: item
        }, {
            reload: false
        });
    };

    var data = _this.loadVitals();
})

.controller('AccountCtrl', function ($scope, $localForage) {

    $scope.loadSettings = function () {
        $localForage.getItem('settings-setting-1').then(function (response) {
            $scope.setting1 = response;
        });
        $localForage.getItem('settings-setting-2').then(function (response) {
            $scope.setting2 = response;
        });
        $localForage.getItem('settings-setting-3').then(function (response) {
            $scope.setting3 = response;
        });
    }
    $scope.changeSetting1 = function () {
        if ($scope.setting1 == false) {
            $scope.setting1 = true;
        } else {
            $scope.setting1 = false;
        }
        $localForage.setItem('settings-setting-1', $scope.setting1);
    };
    $scope.changeSetting2 = function () {
        if ($scope.setting2 == false) {
            $scope.setting2 = true;
        } else {
            $scope.setting2 = false;
        }
        $localForage.setItem('settings-setting-2', $scope.setting2);
    };
    $scope.changeSetting3 = function () {
        if ($scope.setting3 == false) {
            $scope.setting3 = true;
        } else {
            $scope.setting3 = false;
        }
        $localForage.setItem('settings-setting-3', $scope.displayCeased);
    };
    $scope.loadSettings();
})

.controller('LoginCtrl', function ($scope, $state, $ionicPopup, AuthService) {

    $scope.data = {};

    $scope.login = function (data) {
        AuthService.login(data.username, data.password).then(function (authenticated) {
            data.username = '';
            data.password = '';

            $state.go('tab.patients', {}, {
                reload: false
            });
            //$scope.setCurrentUsername(data.username);
        }, function (err) {

            data.username = '';
            data.password = '';

            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials!'
            });
        });
    };
});