/**
 * @file 两个选择框多级选择组建
 * @author 862802759@qq.com
 */
angular.module('DualMultiSelect', ['TreeView']).directive('dualmultiselect',
function ($q, $filter) {
    return {
        restrict: 'AE',
        scope: {
            inputModel: '=',
            ngModel: '=',
            outputAllInfo: '=',
            recursionCheck: '=',
            outputAllInfo: '=',
            outputDuplicate: '=',
            recursionExpand: '=',
            options: '='
        },
        controller: function ($scope) {
            var id = 0;
            $scope.options = $scope.options || {};
            $scope.valueProperty = $scope.options.valueProperty || 'id';
            $scope.displayProperty = $scope.options.displayProperty || 'text';
            $scope.childrenProperty = $scope.options.childrenProperty || 'children';
            $scope.labelSelected = $scope.options.labelSelected || '已选择的内容';
            $scope.labelAll = $scope.options.labelAll || '待选择内容';
            $scope.buttonCheckAll = $scope.options.buttonCheckAll || '全选';
            $scope.buttonDeselectAll = $scope.options.buttonDeselectAll || '全不选';

            var utils = {
                find: function (source, target) {
                    if (angular.isObject(target)) {
                        for (var i = 0; i < source.length; i++) {
                            if (target.body[$scope.valueProperty] === source[i].body[$scope.valueProperty]) {
                                return i;
                            }
                        }
                        return -1;
                    }
                    return source.indexOf(target);
                }
            };

            function initDatas() {
                var deferred = $q.defer();
                if (angular.isFunction($scope.inputModel.then)) {
                    $scope.inputModel.then(function (response) {
                        deferred.resolve({
                            data: response.data
                        });
                    });
                }
                else {
                    deferred.resolve({
                        data: $scope.inputModel
                    });
                }

                deferred.promise.then(function (response) {
                    $scope.items = angular.copy(response.data);
                    var helpers = createHelpers($scope.items);
                    $scope.rootMap = helpers.rootMap;
                    $scope.helperArray = helpers.arr;
                });

                return deferred.promise;
            }

            function createHelpers(value) {
                var rootMap = [];
                var arr = [];

                function createHelper(value, parent) {
                    if (!angular.isArray(value)) {
                        return;
                    }

                    for (var i = 0; i < value.length; i++) {
                        if (!value[i].hasOwnProperty($scope.valueProperty)) {
                            value[i][$scope.valueProperty] = id++;
                        }
                        var item = {
                            body: value[i],
                            text: value[i][$scope.displayProperty],
                            id: value[i][$scope.valueProperty]
                        };
                        arr.push(item);
                        if (!parent) {
                            rootMap.push(item);
                        }
                        if (value[i][$scope.childrenProperty] && value[i][$scope.childrenProperty].length) {
                            createHelper(value[i][$scope.childrenProperty], value[i]);
                        }
                    }
                }

                createHelper(value);

                return {
                    rootMap: rootMap,
                    arr: arr
                };
            }

            $scope.selectAll = function () {
                var result = [];

                angular.forEach($scope.outputDuplicate ? $scope.helperArray : $scope.rootMap, function (item) {
                    if ($scope.outputAllInfo) {
                        result.push(item);
                    }
                    else {
                        result.push(item.body[$scope.valueProperty]);
                    }
                });

                if (result.length === 0) {
                    $scope.ngModel = undefined;
                }
                else {
                    $scope.ngModel = result;
                }
            };

            $scope.deSelectAll = function () {
                $scope.ngModel = undefined;
            };
            $scope.deSelect = function (id) {
                var result = angular.copy($scope.ngModel);
                var itemTofind = id;
                if ($scope.outputAllInfo) {
                    itemTofind = {body: {}};
                    itemTofind.body[$scope.valueProperty] = id;
                }

                var index = utils.find(result, itemTofind);
                result.splice(index, 1);
                if (result.length === 0) {
                    $scope.ngModel = undefined;
                }
                else {
                    $scope.ngModel = result;
                }
            };
            $scope.isShow = function (id) {
                if (!angular.isArray($scope.ngModel)) {
                    return false;
                }
                var itemTofind;
                if ($scope.outputAllInfo) {
                    itemTofind = {body: {}};
                    itemTofind.body[$scope.valueProperty] = id;
                }
                else {
                    itemTofind = id;
                }
                return utils.find($scope.ngModel, itemTofind) !== -1;
            };

            $scope.dataPasser = initDatas();
        },
        templateUrl: 'angular-dual-multi-select.tpl'
    };
});
