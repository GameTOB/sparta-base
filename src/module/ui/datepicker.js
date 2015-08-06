//forked from https://github.com/g00fy-/angular-datepicker
angular.module('module')

.constant('UIDatePickerConfig', {
    templateUrl: 'module/ui/template/datepicker.tpl',
    view: 'date',
    views: ['year', 'month', 'date', 'hours', 'minutes'],
    format: 'yyyy-MM-dd HH:mm',
    closeOnDateSelection: true,
    step: 5,
    appendToBody: false
})

.filter('UITime', function() {
    function format(date) {
        return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
    }

    return function(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
            if (isNaN(date.getTime())) {
                return undefined;
            }
        }
        return format(date);
    };
})

.factory('UIDatePickerUtils', function() {
    var createNewDate = function(year, month, day, hour, minute) {
        // without any arguments, the default date will be 1899-12-31T00:00:00.000Z
        return new Date(year | 0, month | 0, day | 0, hour | 0, minute | 0);
    };
    return {
        getVisibleMinutes: function(date, step) {
            date = new Date(date || new Date());
            var year = date.getFullYear();
            var month = date.getMonth();
            var day = date.getDate();
            var hour = date.getHours();
            var minutes = [];
            var minute, pushedDate;
            for (minute = 0; minute < 60; minute += step) {
                pushedDate = createNewDate(year, month, day, hour, minute);
                minutes.push(pushedDate);
            }
            return minutes;
        },
        getVisibleWeeks: function(date) {
            date = new Date(date || new Date());
            var startMonth = date.getMonth();
            var startYear = date.getYear();
            // set date to start of the week
            date.setDate(1);

            if (date.getDay() === 0) {
                // day is sunday, let's get back to the previous week
                date.setDate(-5);
            } else {
                // day is not sunday, let's get back to the start of the week
                date.setDate(date.getDate() - (date.getDay() - 1));
            }
            if (date.getDate() === 1) {
                // day is monday, let's get back to the previous week
                date.setDate(-6);
            }

            var weeks = [];
            var week;
            while (weeks.length < 6) {
                if (date.getYear() === startYear && date.getMonth() > startMonth) {
                    break;
                }
                week = this.getDaysOfWeek(date);
                weeks.push(week);
                date.setDate(date.getDate() + 7);
            }
            return weeks;
        },
        getVisibleYears: function(date) {
            date = new Date(date || new Date());
            date.setFullYear(date.getFullYear() - (date.getFullYear() % 10));
            var year = date.getFullYear();
            var years = [];
            var pushedDate;
            for (var i = 0; i < 12; i++) {
                pushedDate = createNewDate(year);
                years.push(pushedDate);
                year++;
            }
            return years;
        },
        getDaysOfWeek: function(date) {
            date = new Date(date || new Date());
            date.setDate(date.getDate() - (date.getDay() - 1));
            var year = date.getFullYear();
            var month = date.getMonth();
            var day = date.getDate();
            var days = [];
            var pushedDate;
            for (var i = 0; i < 7; i++) {
                pushedDate = createNewDate(year, month, day);
                days.push(pushedDate);
                day++;
            }
            return days;
        },
        getVisibleMonths: function(date) {
            date = new Date(date || new Date());
            var year = date.getFullYear();
            var months = [];
            var pushedDate;
            for (var month = 0; month < 12; month++) {
                pushedDate = createNewDate(year, month, 1);
                months.push(pushedDate);
            }
            return months;
        },
        getVisibleHours: function(date) {
            date = new Date(date || new Date());
            var year = date.getFullYear();
            var month = date.getMonth();
            var day = date.getDate();
            var hours = [];
            var hour, pushedDate;
            for (hour = 0; hour < 24; hour++) {
                pushedDate = createNewDate(year, month, day, hour);
                hours.push(pushedDate);
            }
            return hours;
        },
        isAfter: function(model, date) {
            return model.getTime() >= date.getTime();
        },
        isBefore: function(model, date) {
            return model.getTime() <= date.getTime();
        },
        isSameYear: function(model, date) {
            return model.getFullYear() === date.getFullYear();
        },
        isSameMonth: function(model, date) {
            return this.isSameYear(model, date) && model.getMonth() === date.getMonth();
        },
        isSameDay: function(model, date) {
            return this.isSameMonth(model, date) && model.getDate() === date.getDate();
        },
        isSameHour: function(model, date) {
            return this.isSameDay(model, date) && model.getHours() === date.getHours();
        },
        isSameMinutes: function(model, date) {
            return this.isSameHour(model, date) && model.getMinutes() === date.getMinutes();
        },
        isValidDate: function(value) {
            // Invalid Date: getTime() returns NaN
            return value && !(value.getTime && value.getTime() !== value.getTime());
        },
        parseDate: function(value, willReturn) {
            if (angular.isNumber(value)) {
                // presumably timestamp to date object
                value = new Date(value);
            }
            willReturn = willReturn || NaN;
            if (!value) {
                return willReturn;
            } else if (angular.isDate(value)) {
                return angular.copy(value);
            } else if (angular.isString(value)) {
                var time = Date.parse(value);
                if (isNaN(time)) {
                    return willReturn;
                } else {
                    return new Date(value);
                }
            } else {
                return willReturn;
            }
        }
    };
})


.directive('uiDatePicker', ['UIDatePickerConfig', 'UIDatePickerUtils', '$filter','$log',
    function datePickerDirective(UIDatePickerConfig, UIDatePickerUtils, $filter , $log) {
        var dateFilter = $filter('date');
        return {
            restrict: 'AE',
            replace: true,
            require: '?^ngModel',
            templateUrl: UIDatePickerConfig.templateUrl,
            scope: {
                after: '=?',
                minDate: '=?',
                before: '=?',
                maxDate: '=?',
                dateDisabled : '&'
            },
            link: function(scope, element, attrs, ngModel) {
                var step = parseInt(attrs.step || UIDatePickerConfig.step, 10),
                    model = new Date(),
                    arrowClick = false,
                    now = new Date(),
                    format = attrs.format || UIDatePickerConfig.format;
                var views = UIDatePickerConfig.views;
                scope.date = new Date();
                scope.view = attrs.view || UIDatePickerConfig.view;
                views = views.slice(
                    views.indexOf(attrs.maxView || views[0]),
                    views.indexOf(attrs.minView || views[views.length-1]) + 1
                );
                if (views.length === 1 || views.indexOf(scope.view) === -1) {
                    scope.view = views[0];
                }

                if (ngModel) {
                    ngModel.$render = function() {
                        $log.info("render-picker", ngModel.$modelValue);
                        model = UIDatePickerUtils.parseDate(ngModel.$modelValue, new Date());
                        scope.date = angular.copy(model);
                    };

                    function parser(viewValue) {
                        $log.info("parser-picker", viewValue);
                        return UIDatePickerUtils.parseDate(viewValue);
                    };

                    ngModel.$parsers.unshift(parser);
                    ngModel.$viewChangeListeners.push(function() {
                        $log.info('viewChangeListeners-picker', ngModel.$modelValue);
                    });
                }

                scope.setView = function(nextView) {
                    if (views.indexOf(nextView) !== -1) {
                        setTimeout(function(){
                            scope.view = nextView;
                            scope.$apply();
                        },100);
                        //scope.view = nextView;
                    }
                };

                scope.setLastView = function(nextView) {
                    var index = views.indexOf(scope.view),
                        lastView = index > 0 ? views[index - 1] : null;
                    if (lastView) {
                        scope.view = lastView;
                    }
                };

                scope.setDate = function(date) {
                    if (attrs.disabled) {
                        return;
                    }
                    scope.date = date;
                    // change next view
                    var nextView = views[views.indexOf(scope.view) + 1];
                    switch (scope.view) {
                        case 'minutes':
                            model.setMinutes(date.getMinutes());
                            /*falls through*/
                        case 'hours':
                            model.setHours(date.getHours());
                            /*falls through*/
                        case 'date':
                            model.setDate(date.getDate());
                            /*falls through*/
                        case 'month':
                            model.setMonth(date.getMonth());
                            /*falls through*/
                        case 'year':
                            model.setFullYear(date.getFullYear());
                    }

                    if (nextView) {
                        scope.setView(nextView);
                    } else {
                        if (ngModel) {
                            ngModel.$setViewValue(angular.copy(model));
                            ngModel.$render();
                        }
                        scope.$emit('setDate', model, scope.view);
                    }
                    arrowClick = false;
                };

                function update() {
                    var view = scope.view;
                    if (model && !arrowClick) {
                        scope.date = new Date(model);
                    }
                    var date = scope.date;

                    switch (view) {
                        case 'year':
                            scope.years = UIDatePickerUtils.getVisibleYears(date);
                            break;
                        case 'month':
                            scope.months = UIDatePickerUtils.getVisibleMonths(date);
                            break;
                        case 'date':
                            scope.weekdays = scope.weekdays || UIDatePickerUtils.getDaysOfWeek();
                            scope.weeks = UIDatePickerUtils.getVisibleWeeks(date);
                            break;
                        case 'hours':
                            scope.hours = UIDatePickerUtils.getVisibleHours(date);
                            break;
                        case 'minutes':
                            scope.minutes = UIDatePickerUtils.getVisibleMinutes(date, step);
                            break;
                    }
                }

                function watch() {
                    if (scope.view !== 'date') {
                        return scope.view;
                    }
                    return scope.date ? scope.date.getMonth() : null;
                }


                scope.$watch(watch, update);

                scope.next = function(delta) {
                    var date = scope.date;
                    delta = delta || 1;
                    switch (scope.view) {
                        case 'year':
                        case 'month':
                            date.setFullYear(date.getFullYear() + delta);
                            break;
                        case 'date':
                            /* Reverting from ISSUE #113
          var dt = new Date(date);
          date.setMonth(date.getMonth() + delta);
          if (date.getDate() < dt.getDate()) {
            date.setDate(0);
          }
          */
                            date.setMonth(date.getMonth() + delta);
                            break;
                        case 'hours':
                        case 'minutes':
                            date.setHours(date.getHours() + delta);
                            break;
                    }
                    arrowClick = true;
                    update();
                };

                scope.prev = function(delta) {
                    return scope.next(-delta || -1);
                };

                scope.isDisabled = function(date){
                    if(scope.view=="date"){
                        return (scope.minDate && date < scope.minDate) || (scope.maxDate && date > scope.maxDate) || (attrs.dateDisabled && scope.dateDisabled({date: date, view: scope.view}));
                    }
                    return attrs.dateDisabled && scope.dateDisabled({date: date, view: scope.view});
                };

                scope.isAfter = function(date) {
                    return scope.after && UIDatePickerUtils.isAfter(date, scope.after);
                };

                scope.isBefore = function(date) {
                    return scope.before && UIDatePickerUtils.isBefore(date, scope.before);
                };

                scope.isSameMonth = function(date) {
                    return UIDatePickerUtils.isSameMonth(model, date);
                };

                scope.isSameYear = function(date) {
                    return UIDatePickerUtils.isSameYear(model, date);
                };

                scope.isSameDay = function(date) {
                    return UIDatePickerUtils.isSameDay(model, date);
                };

                scope.isSameHour = function(date) {
                    return UIDatePickerUtils.isSameHour(model, date);
                };

                scope.isSameMinutes = function(date) {
                    return UIDatePickerUtils.isSameMinutes(model, date);
                };

                scope.isNow = function(date) {
                    var is = true;
                    //noinspection FallThroughInSwitchStatementJS
                    switch (scope.view) {
                        case 'minutes':
                            is &= ~~(date.getMinutes() / step) === ~~(now.getMinutes() / step);
                            /*falls through*/
                        case 'hours':
                            is &= date.getHours() === now.getHours();
                            /*falls through*/
                        case 'date':
                            is &= date.getDate() === now.getDate();
                            /*falls through*/
                        case 'month':
                            is &= date.getMonth() === now.getMonth();
                            /*falls through*/
                        case 'year':
                            is &= date.getFullYear() === now.getFullYear();
                    }
                    return is;
                };
            }
        };
    }
])

.directive('uiDateRange', function() {
    return {
        restrict: 'AE',
        templateUrl: 'module/ui/template/daterange.tpl',
        scope: {
            start: '=',
            end: '='
        },
        link: function(scope, element, attrs) {

            /*
             * If no date is set on scope, set current date from user system
             */
            scope.start = new Date(scope.start || new Date());
            scope.end = new Date(scope.end || new Date());

            attrs.$observe('disabled', function(isDisabled) {
                scope.disableDatePickers = !!isDisabled;
            });
            scope.$watch('start.getTime()', function(value) {
                if (value && scope.end && value > scope.end.getTime()) {
                    scope.end = new Date(value);
                }
            });
            scope.$watch('end.getTime()', function(value) {
                if (value && scope.start && value < scope.start.getTime()) {
                    scope.start = new Date(value);
                }
            });
        }
    };
})

.directive('uiDateTimeAppend', function() {
    return {
        link: function(scope, element) {
            element.bind('click', function() {
                element.find('input')[0].focus();
            });
        }
    };
})

.directive('uiDateTime', ['$compile', '$document', '$filter', 'UIDatePickerConfig', 'UIDatePickerUtils','$log',

    function($compile, $document, $filter, UIDatePickerConfig, UIDatePickerUtils,$log) {
        var body = $document.find('body');
        var dateFilter = $filter('date');

        return {
            restrict: 'AE',
            require: 'ngModel',
            scope: {
                dateDisabled: '&'
            },
            link: function(scope, element, attrs, ngModel) {
                scope.picked = NaN;
                scope.watchData = {};

                var format = attrs.format || UIDatePickerConfig.format;
                var views = UIDatePickerConfig.views ;
                var closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$parent.$eval(attrs.closeOnDateSelection) : UIDatePickerConfig.closeOnDateSelection;
                var appendToBody = angular.isDefined(attrs.appendToBody) ? scope.$parent.$eval(attrs.appendToBody) : UIDatePickerConfig.appendToBody;
                var picker = null;
                var container = null;
                var clickFromPicker = false;
                var makePopupTemplate = (function() {
                    function cameltoDash(string) {
                        return string.replace(/([A-Z])/g, function($1) {
                            return '-' + $1.toLowerCase();
                        });
                    }
                    return function() {
                        var datepickerEl = angular.element('<div ui-date-picker class="ui-date-picker-date-time"></div>');
                        var pickerAttrs = {
                            'ng-model': 'picked',
                            'ng-change': 'dateSelection(date)'
                        };
                        //不可变
                        ['minView', 'maxView', 'view', 'step'].forEach(function(key) {
                            if (attrs[key]) {
                                //如果不为Express则直接取其字符串
                                pickerAttrs[cameltoDash(key)] = scope.$parent.$eval(attrs[key]) || attrs[key];
                                //将数组转成特定字符串 -> 已废弃用法
                                // if(key=="views"){
                                //     pickerAttrs[cameltoDash(key)] = "['"+pickerAttrs[cameltoDash(key)].join("','")+"']";
                                // }
                            }
                        });
                        //可变
                        ['minDate', 'maxDate'].forEach(function(key) {
                            if (attrs[key]) {
                                //scope.watchDate 再各自需要的地方定义及赋值            
                                pickerAttrs[cameltoDash(key)] = 'watchData.' + key;
                            }
                        });
                        if (attrs.dateDisabled) {
                            pickerAttrs['date-disabled'] = 'dateDisabled({ date: date, view: view })';
                        }

                        datepickerEl.attr(pickerAttrs);

                        var template = datepickerEl[0];
                        datepickerEl.remove();
                        //只返回文本内容 因为DOM再compile后会绑定很多奇怪属性 会影响再次compile
                        return template;
                    }
                })()

                var template = makePopupTemplate();


                //modelValue ->format[]()-> {viewValue->render()}->validator[key]()
                function formatter(modelValue) {
                    //先将model变为dateObj 有可能是第三方不可控改变的
                    var modelValue = UIDatePickerUtils.parseDate(modelValue)
                    $log.info("formatter-input", modelValue, format, dateFilter(modelValue, format));
                    if (UIDatePickerUtils.isValidDate(modelValue)) {
                        scope.picked = modelValue
                    }
                    return modelValue ? dateFilter(modelValue, format) : "";
                }

                //viewValue ->parser[]()-> modelValue->validator[key]()->$viewChangeListeners()
                function parser(viewValue) {
                    $log.info("parser-input", viewValue, UIDatePickerUtils.parseDate(viewValue));
                    var modelValue = UIDatePickerUtils.parseDate(viewValue);
                    if (UIDatePickerUtils.isValidDate(modelValue)) {
                        scope.picked = modelValue
                    }
                    return modelValue;
                }

                function validator(modelValue, viewValue) {
                    $log.info("validator-input", modelValue, viewValue);
                    var value = modelValue || viewValue;
                    if (isNaN(value)){
                        return false
                    }else if(!value) {
                        return true;
                    } else {
                        return UIDatePickerUtils.isValidDate(UIDatePickerUtils.parseDate(viewValue));
                    }
                }
                ngModel.$$parserName = 'date';
                ngModel.$validators.date = validator;
                ngModel.$formatters.push(formatter);
                ngModel.$parsers.unshift(parser);
                ngModel.$viewChangeListeners.push(function() {
                    $log.info('viewChangeListeners-input', ngModel.$modelValue);
                });


                if (attrs.minDate) {
                    var minVal;
                    ngModel.$validators.min = function(value) {
                        return !minVal || !UIDatePickerUtils.isValidDate(minVal) || !UIDatePickerUtils.isValidDate(value) || value >= minVal;
                    };
                    scope.$parent.$watch(attrs.minDate, function(val) {
                        minVal = UIDatePickerUtils.parseDate(val);
                        if(UIDatePickerUtils.isValidDate(minVal)){
                            minVal.setHours(0,0,0,0);
                            ngModel.$validate();
                            scope.watchData['minDate'] = minVal;
                        }
                    });
                }

                if (attrs.maxDate) {
                    var maxVal;
                    ngModel.$validators.max = function(value) {
                        return !maxVal || !UIDatePickerUtils.isValidDate(maxVal) || !UIDatePickerUtils.isValidDate(value) || value <= maxVal;
                    };
                    scope.$parent.$watch(attrs.maxDate, function(val) {
                        maxVal = UIDatePickerUtils.parseDate(val);
                        if(UIDatePickerUtils.isValidDate(minVal)){
                            maxVal.setHours(23,60,0,0);
                            ngModel.$validate();
                            scope.watchData['maxDate'] = maxVal;
                        }
                    });
                }

                element.on('click', open);
                $document.on('mousedown', documentClickBind);

                scope.$on('setDate', function(event, date, view) {
                    var date = date ? dateFilter(date, format) : '';
                    $log.info('setDate', date);
                    ngModel.$setViewValue(date)
                    ngModel.$render();
                    if (closeOnDateSelection) {
                        close();
                        //只能此时给焦点 以免干扰其他交互
                        element[0].focus();
                    }
                });

                scope.$on('$destroy', function() {
                    element.off('click', open);
                    $document.off('mousedown', documentClickBind);
                    close();
                });

                function documentClickBind(event){
                    //console.log(event.target , angular.element(event.target).closest("[ui-date-picker]"),picker && picker[0].contains(event.target));
                    //由于采用ng-switch方案瞬间摘出DOM，所以根本无法准备判断父子关系
                    //console.log(clickFromPicker);
                    if(event.target != element[0] && picker && clickFromPicker==false){
                        close();
                    }
                }

                function close() {
                    if (picker) {
                        picker.remove();
                        picker = null;
                    }
                    if (container) {
                        container.remove();
                        container = null;
                    }
                }

                function open() {
                    if (picker) {
                        return;
                    }
                    picker = $compile(template)(scope);
                    scope.$digest();
                    if (appendToBody) {
                        var pos = angular.extend(element.offset(), {
                            height: element[0].offsetHeight
                        });
                        picker.css({
                            top: pos.top + pos.height,
                            left: pos.left,
                            display: 'block',
                            position: 'absolute'
                        });
                        body.append(picker);
                    } else {
                        container = angular.element('<div ui-date-picker-wrapper></div>');
                        element[0].parentElement.insertBefore(container[0], element[0]);
                        var pos = angular.extend(element.position(), {
                            height: element[0].offsetHeight
                        }) ,wrapPos = container.position();
                        container.append(picker);
                        picker.css({
                            left: pos.left - wrapPos.left,
                            top: pos.top + pos.height - wrapPos.top,
                            display: 'block'
                        });
                    }

                    //由于采用ng-switch方案瞬间摘出DOM，所以根本无法准备判断父子关系
                    //但又不想强制picker不做冒泡 这样强制不冒泡有阻碍正常行为的风险
                    //故采取flag方式
                    picker.on('mousedown', function(evt) {
                        clickFromPicker = true;
                        //这里不用$timeout
                        setTimeout(function(){
                            clickFromPicker = false;
                        },0);
                    });
                }

            }
        };
    }
]);