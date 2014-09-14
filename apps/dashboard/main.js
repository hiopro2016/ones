(function(){
    //控制面板应用
    angular.module("ones.dashboard", [])
        .config(["$routeProvider", function($route){
            $route
                .when('/HOME/Index/dashboard', {
                    controller: "HOMEDashboardCtl",
                    templateUrl: appView("dashboard.html", "dashboard")
                })
                .when('/dashboard/list/myDesktop', {
                    templateUrl: appView("myDesktop.html", "dashboard"),
                    controller: "HomeMyDesktopCtl"
                })
                .when('/', {
                    controller: "HOMEDashboardCtl",
                    templateUrl: appView("dashboard.html", "dashboard")
                })
                .otherwise({
                    redirectTo: '/HOME/Index/dashboard'
                })
            ;
        }])
        .factory("MyDesktopRes", ["$resource", "ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"dashboard/myDesktop/:id.json");
        }])
        .factory("UserDesktopRes", ["$resource", "ones.config", function($resource, cnf){
            return $resource(cnf.BSU + "dashboard/userDesktop/:id.json", null, {
                update: {method: "PUT"}
            });
        }])

        .service("UserDesktopModel", function(){
            return {
                getStructure: function(){
                    return {
                        id: {primary: true},
                        name: {},
                        template: {},
                        width: {
                            value: 6,
                            max: 12,
                            inputType: "number"
                        },
                        listorder: {
                            inputType: "number",
                            value: 99
                        }
                    };
                }
            };
        })

        .controller("HomeMyDesktopCtl", ["$scope", "MyDesktopRes", "$location", function($scope, res, $location){
            res.query().$promise.then(function(data){
                $scope.items = data;
            });
            $scope.doSubmit = function() {
                res.save($scope.items);
                $location.url("/");
            };
        }])

        .controller("HOMEDashboardCtl", ["$scope", "$rootScope", "MyDesktopRes", "ones.config", "pluginExecutor", "$timeout", "Department.UserAPI",
            function($scope, $rootScope, MyDesktopRes, conf, plugin, $timeout, user){

                var chars = 'abcdefghijklmnopqrstuvwxyz';
                var btnClasses = [
                    "default", "success", "inverse", "danger", "warning", "primary",
                    "info", "purple", "pink", "grey", "light", "yellow"
                ];

                ones.pluginScope.set("dashboardAppBtns", []);
                ones.pluginScope.set("dashboardSetBtnTip", function(btnName, tip){
                    $timeout(function(){
                        for(var i=0;i<$scope.appBtns.length;i++) {
                            if($scope.appBtns[i].name == btnName) {
                                $scope.appBtns[i].tip = tip;
                                break;
                            }
                        }
                    }, 1000);
                });
//                ones.pluginScope.dashboardAppBtns = [];
//                ones.pluginScope.dashboardSetBtnTip = function(btnName, tip){
//                    $timeout(function(){
//                        for(var i=0;i<$scope.appBtns.length;i++) {
//                            if($scope.appBtns[i].name == btnName) {
//                                $scope.appBtns[i].tip = tip;
//                                break;
//                            }
//                        }
//                    }, 1000);
//                };
                $scope.appBtns = [];
                $timeout(function(evt, data){
                    plugin.callPlugin("hook.dashboard.appBtn", $scope);
                    var dashboardAppBtns = ones.pluginScope.get("dashboardAppBtns");
                    dashboardAppBtns.sort(arraySortBy("sort"));
                    angular.forEach(dashboardAppBtns, function(app){
                        //权限检测
                        var authNode;
                        if(app.authNode) {
                            authNode = app.authNode;
                        } else {
                            var tmp = app.link.split("/");
                            var action = "read";
                            switch(tmp[2]) {
                                case "add":
                                case "addBill":
                                    action = "add";
                                    break;
                                case "edit":
                                case "editBill":
                                    action = "edit";
                                    break;
                            }
                            authNode = [tmp[0],tmp[2],action].join(".").toLowerCase();
                        }

                        try {
                            if($scope.$parent.authedNodes.indexOf(authNode) < 0) {
                                return false;
                            }
                        } catch(e) {
                            return false;
                        }


                        //底色
                        if(!app.btnClass){
                            var tmp = md5.createHash(app.label).slice(2,3);
                            var tmpIndex = chars.indexOf(tmp);
                            if(tmpIndex >= 0) {
                                if(tmpIndex > 11) {
                                    tmpIndex -= 11;
                                }
                                if(tmpIndex > 21) {
                                    tmpIndex -= 21;
                                }
                            } else {
                                tmpIndex = tmp;
                            }
                            app.btnClass = btnClasses[tmpIndex];
                        }
                        //图标
                        if(!app.icon){
                            app.icon = "folder-close-alt";
                        }

                        $scope.appBtns.push(app);
                    });
                }, 300);


                $scope.dashboardItems = [];
                MyDesktopRes.query({
                    onlyUsed: true
                }, function(data){
                    angular.forEach(data, function(block){
                        if(block.template.indexOf("/") < 0) {
                            block.template = appView("blocks/"+block.template, "dashboard");
                        }
                    });
                    $scope.dashboardItems = data;
                });
            }])

        .controller("DashboardProduceInProcess", ["$scope", "ProducePlanDetailRes", function($scope, res){
            res.query({
                limit: 5
            }).$promise.then(function(data){
                $scope.items = data;
            });
        }])

        .controller("DashboardStockinCtl", ["$scope", "StockinRes", function($scope, res){
            res.query({
                latest: true,
                limit: 5
            }).$promise.then(function(data){
                $scope.items = data;
            });
        }])

        .controller("DashboardStockoutCtl", ["$scope", "StockoutRes", function($scope, res){
            res.query({
                latest: true,
                limit: 5,
                handled: true
            }).$promise.then(function(data){
                $scope.items = data;
            });
        }])

        .controller("DashboardNeedStockoutCtl", ["$scope", "StockoutRes", function($scope, res){
            res.query({
                latest: true,
                unhandled: true,
                limit: 5
            }).$promise.then(function(data){
                $scope.items = data;
            });
        }])
    ;
})();