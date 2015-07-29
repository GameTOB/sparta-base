'use strict';
//forked from https://github.com/g00fy-/angular-datepicker
angular.module('module')

.constant('UIDatePickerConfig', {
    templateUrl: 'module/ui/template/datepicker.tpl',
    view: 'date',
    views: ['year', 'month', 'date', 'hours', 'minutes'],
    format: 'yyyy-MM-dd HH:mm',
    autoClose: false,
    step: 5,
    appendToBody : false,
    popupTemplate: function(attrs) {
        return '' + '<div ' + 'ui-date-picker ng-model="date" ' + (attrs.view ? 'view="' + attrs.view + '" ' : '') + (attrs.maxView ? 'max-view="' + attrs.maxView + '" ' : '') + (attrs.autoClose ? 'auto-close="' + attrs.autoClose + '" ' : '') + (attrs.template ? 'template="' + attrs.template + '" ' : '') + (attrs.minView ? 'min-view="' + attrs.minView + '" ' : '') + (attrs.step ? 'step="' + attrs.step + '" ' : '') + 'class="ui-date-picker-date-time"></div>';
    }
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
        return new Date(Date.UTC(year | 0, month | 0, day | 0, hour | 0, minute | 0));
    };
    return {
        getVisibleMinutes: function(date, step) {
            date = new Date(date || new Date());
            var year = date.getFullYear();
            var month = date.getMonth();
            var day = date.getDate();
            var hour = date.getUTCHours();
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
        parseDate : function(value , willReturn){
            if (angular.isNumber(value)) {
              // presumably timestamp to date object
              value = new Date(value);
            }
            if(!value){
                return willReturn;
            }else if(angular.isDate(value)){
                return value;
            }else if(angular.isString(value)){
                var time = Date.parse(value);
                if(isNaN(time)){
                    return willReturn;
                }else{
                    return new Date(value);
                }    
            }else {
                return willReturn;
            }
        }
    };
})


.directive('uiDatePicker', ['UIDatePickerConfig', 'UIDatePickerUtils', '$parse' , '$filter',
    function datePickerDirective(UIDatePickerConfig, UIDatePickerUtils , $parse , $filter) {
        var dateFilter = $filter('date');
        return {
            restrict: 'EA',
            replace: true,
            require: '?^ngModel',
            templateUrl: UIDatePickerConfig.templateUrl,
            scope: {
                after: '=?',
                before: '=?'
            },
            link: function(scope, element, attrs, ngModel) {
                var step = parseInt(attrs.step || UIDatePickerConfig.step, 10),
                    model = new Date(),
                    arrowClick = false,
                    now = new Date(),
                    format = attrs.format || UIDatePickerConfig.format;
                scope.views = UIDatePickerConfig.views;
                scope.date = new Date();
                scope.view = attrs.view || UIDatePickerConfig.view;
                scope.views = scope.views.slice(
                    scope.views.indexOf(attrs.maxView || 'year'),
                    scope.views.indexOf(attrs.minView || 'minutes') + 1
                );
                if (scope.views.length === 1 || scope.views.indexOf(scope.view) === -1) {
                    scope.view = scope.views[0];
                }

                if(ngModel){
                    ngModel.$render = function(){
                        model = UIDatePickerUtils.parseDate(ngModel.$modelValue , new Date());
                        scope.date = angular.copy(model);
                    };

                    function parser(viewValue) {
                        console.log("parser-picker",viewValue);
                        return UIDatePickerUtils.parseDate(viewValue);
                    };

                    ngModel.$parsers.unshift(parser);
                    ngModel.$viewChangeListeners.push(function () {
                        console.log('viewChangeListeners-picker',ngModel.$modelValue);
                    });
                }                

                // if(ngModel){
                //     if (angular.isDefined(attrs.minDate)) {
                //         var minVal;
                //         ngModel.$validators.min = function(value) {
                //             return !UIDatePickerUtils.isValidDate(value) || angular.isUndefined(minVal) || value >= minVal;
                //         };
                //         attrs.$observe('minDate', function(val) {
                //             minVal = new Date(val);
                //             ngModel.$validate();
                //         });
                //     }

                //     if (angular.isDefined(attrs.maxDate)) {
                //         var maxVal;
                //         ngModel.$validators.max = function(value) {
                //             return !UIDatePickerUtils.isValidDate(value) || angular.isUndefined(maxVal) || value <= maxVal;
                //         };
                //         attrs.$observe('maxDate', function(val) {
                //             maxVal = new Date(val);
                //             ngModel.$validate();
                //         });
                //     }
                // }

                //end min, max date validator

                scope.setView = function(nextView) {
                    if (scope.views.indexOf(nextView) !== -1) {
                        scope.view = nextView;
                    }
                };

                scope.setLastView = function(nextView) {
                    var index = scope.views.indexOf(scope.view),
                        lastView = index > 0 ? scope.views[index - 1]:null;
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
                    var nextView = scope.views[scope.views.indexOf(scope.view) + 1];
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
                    }else{
                        if(ngModel){
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
                            /*falls through*/
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
                            /*falls through*/
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

.directive('uiDateTime', ['$compile', '$document', '$filter', 'UIDatePickerConfig', '$parse', 'UIDatePickerUtils',

    function($compile, $document, $filter, UIDatePickerConfig, $parse, UIDatePickerUtils) {
        var body = $document.find('body');
        var dateFilter = $filter('date');

        return {
            restrict: 'EA',
            require: 'ngModel',
            scope: {},
            link: function(scope, element, attrs, ngModel) {
                var format = attrs.format || UIDatePickerConfig.format;
                var views = UIDatePickerConfig.views;
                var autoClose = attrs.autoClose ? $parse(attrs.autoClose)(scope) : UIDatePickerConfig.autoClose;
                var picker = null;
                var container = null;
                var appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? scope.$parent.$eval(attrs.datepickerAppendToBody) : UIDatePickerConfig.appendToBody;

                function formatter(modelValue) {
                    //先将model变为dateObj 有可能是第三方不可控改变的
                    var modelValue = UIDatePickerUtils.parseDate(modelValue)
                    console.log("formatter-input",modelValue ,format,dateFilter(modelValue, format));
                    return modelValue ? dateFilter(modelValue, format) : "";
                }

                function parser(viewValue) {
                    console.log("parser-input",viewValue,UIDatePickerUtils.parseDate(viewValue));
                    return UIDatePickerUtils.parseDate(viewValue);
                }

                function validator(modelValue, viewValue) {
                    console.log("validator-input",modelValue, viewValue);
                    var value = modelValue || viewValue;
                    if(!value){
                        return true;
                    }else{
                        return !angular.isUndefined(UIDatePickerUtils.parseDate(viewValue)); 
                    }
                }

                ngModel.$$parserName = 'date';
                ngModel.$validators.date = validator;
                ngModel.$formatters.push(formatter);
                ngModel.$parsers.unshift(parser);
                ngModel.$viewChangeListeners.push(function () {
                    console.log('viewChangeListeners-input',ngModel.$modelValue);
                    scope.date = ngModel.$modelValue || new Date();
                });


                //min. max date validators
                if (angular.isDefined(attrs.minDate)) {
                    var minVal;
                    ngModel.$validators.min = function(value) {
                        return !UIDatePickerUtils.isValidDate(value) || angular.isUndefined(minVal) || value >= minVal;
                    };
                    attrs.$observe('minDate', function(val) {
                        minVal = new Date(val);
                        ngModel.$validate();
                    });
                }

                if (angular.isDefined(attrs.maxDate)) {
                    var maxVal;
                    ngModel.$validators.max = function(value) {
                        return !UIDatePickerUtils.isValidDate(value) || angular.isUndefined(maxVal) || value <= maxVal;
                    };
                    attrs.$observe('maxDate', function(val) {
                        maxVal = new Date(val);
                        ngModel.$validate();
                    });
                }
                //end min, max date validator

                var template = UIDatePickerConfig.popupTemplate(attrs);

                function clear() {
                    if (picker) {
                        picker.remove();
                        picker = null;
                    }
                    if (container) {
                        container.remove();
                        container = null;
                    }
                }

                function showPicker() {
                    if (picker) {
                        return;
                    }
                    // create picker element
                    picker = $compile(template)(scope);
                    scope.$digest();

                    scope.$on('setDate', function(event, date, view) {
                        var date = date ? dateFilter(date, format) : '';
                        console.log('setDate',date);
                        ngModel.$setViewValue(date)
                        ngModel.$render();
                        if (autoClose && views[views.length - 1] === view) {
                            clear();
                        }
                    });

                    // scope.$on('hidePicker', function() {
                    //     picker.addClass('hidden');
                    //     clear();
                    //     //element.triggerHandler('blur');
                    // });

                    scope.$on('$destroy', function(){
                        element.off('click', showPicker);
                        element.off('blur', clear);
                        clear();
                    });

                    if(appendToBody){
                        var pos = angular.extend(element.offset(), { height: element[0].offsetHeight });
                        picker.css({ top: pos.top + pos.height, left: pos.left, display: 'block', position: 'absolute'});
                        body.append(picker);
                    }else{
                        container = angular.element('<div ui-date-picker-wrapper></div>');
                        element[0].parentElement.insertBefore(container[0], element[0]);
                        container.append(picker);
                        //          this approach doesn't work
                        //          element.before(picker);
                        picker.css({
                            top: element[0].offsetHeight + 'px',
                            display: 'block'
                        });
                    }

                    
                    picker.on('mousedown', function(evt) {
                        evt.preventDefault();
                    });
                }

                element.on('focus', showPicker);
                //element.on('blur', clear);
                
            }
        };
    }
]);