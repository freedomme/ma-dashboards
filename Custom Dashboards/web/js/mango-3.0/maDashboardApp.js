/**
 * Copyright (C) 2015 Deltamation Software. All rights reserved.
 * http://www.deltamation.com.au/
 * @author Jared Wiltshire
 */

define(['./services/Point',
        './services/User',
        './services/PointEventManager',
        './services/Translate',
        './services/mangoHttpInterceptor',
        './services/Util',
        './directives/pointList',
        './directives/pointValue',
        './directives/pointValues',
        './directives/pointStatistics',
        './directives/bandStyle',
        './directives/switchStyle',
        './directives/tankLevel',
        './directives/gaugeChart',
        './directives/serialChart',
        './directives/pieChart',
        './directives/clock',
        './directives/stateChart',
        './directives/copyBlurred',
        './directives/tr',
        './directives/datePicker',
        './directives/dateRangePicker',
        './directives/statisticsTable',
        './directives/startsAndRuntimesTable',
        './directives/setPointValue',
        './directives/switchImg',
        './directives/calc',
        './directives/intervalPicker',
        './directives/pointQuery',
        './directives/getPointValue',
        './filters/momentFilter',
        './filters/durationFilter',
        './filters/trFilter',
        'angular',
        'angular-resource'
], function(Point, User, PointEventManager, Translate, mangoHttpInterceptor, Util, pointList, pointValue, pointValues, pointStatistics,
        bandStyle, switchStyle, tankLevel, gaugeChart, serialChart, pieChart, clock, stateChart, copyBlurred, tr, datePicker,
        dateRangePicker, statisticsTable, startsAndRuntimesTable, setPointValue, switchImg, calc, intervalPicker, pointQuery, getPointValue,
        momentFilter, durationFilter, trFilter, angular) {
'use strict';

var maDashboardApp = angular.module('maDashboardApp', ['ngResource']);

maDashboardApp.factory('Point', Point);
maDashboardApp.factory('User', User);
maDashboardApp.factory('PointEventManager', PointEventManager);
maDashboardApp.factory('Translate', Translate);
maDashboardApp.factory('mangoHttpInterceptor', mangoHttpInterceptor);
maDashboardApp.factory('Util', Util);
maDashboardApp.directive('maPointList', pointList);
maDashboardApp.directive('maPointValue', pointValue);
maDashboardApp.directive('maPointValues', pointValues);
maDashboardApp.directive('maPointStatistics', pointStatistics);
maDashboardApp.directive('maBandStyle', bandStyle);
maDashboardApp.directive('maSwitchStyle', switchStyle);
maDashboardApp.directive('maTankLevel', tankLevel);
maDashboardApp.directive('maGaugeChart', gaugeChart);
maDashboardApp.directive('maSerialChart', serialChart);
maDashboardApp.directive('maPieChart', pieChart);
maDashboardApp.directive('maClock', clock);
maDashboardApp.directive('maStateChart', stateChart);
maDashboardApp.directive('maCopyBlurred', copyBlurred);
maDashboardApp.directive('maTr', tr);
maDashboardApp.directive('maDatePicker', datePicker);
maDashboardApp.directive('maDateRangePicker', dateRangePicker);
maDashboardApp.directive('maStatisticsTable', statisticsTable);
maDashboardApp.directive('maStartsAndRuntimesTable', startsAndRuntimesTable);
maDashboardApp.directive('maSetPointValue', setPointValue);
maDashboardApp.directive('maSwitchImg', switchImg);
maDashboardApp.directive('maCalc', calc);
maDashboardApp.directive('maIntervalPicker', intervalPicker);
maDashboardApp.directive('maPointQuery', pointQuery);
maDashboardApp.directive('maGetPointValue', getPointValue);
maDashboardApp.filter('moment', momentFilter);
maDashboardApp.filter('duration', durationFilter);
maDashboardApp.filter('tr', trFilter);

maDashboardApp.filter('sum', function() {
	return function(rowData) {
		var sum = 0;
		if (!rowData) {
			return sum;
		}
		if (rowData.length !== undefined) {
			for (var i = 0; i < rowData.length; i++) {
				sum += rowData[i];
			}
		} else {
			for (var key in rowData) {
				sum += rowData[key];
			}
		}
		return sum;
	};
});

maDashboardApp.filter('sumColumn', function() {
	return function(tableData, colNum) {
		var sum = 0;
		if (!tableData) {
			return sum;
		}
		if (tableData.length !== undefined) {
			for (var i = 0; i < tableData.length; i++) {
				sum += tableData[i][colNum];
			}
		} else {
			for (var key in tableData) {
				sum += tableData[key][colNum];
			}
		}
		return sum;
	};
});

maDashboardApp.constant('mangoBaseUrl', '');
maDashboardApp.constant('mangoDefaultTimeout', 10000);

maDashboardApp.config(['$httpProvider', function($httpProvider) {
	$httpProvider.interceptors.push('mangoHttpInterceptor');
}]);

maDashboardApp.run(['$rootScope', function($rootScope) {

    $rootScope.rollupTypes = [
        {type: 'NONE', nonNumeric: true, label: 'None'},
        {type: 'AVERAGE', nonNumeric: false, label: 'Average'},
        {type: 'DELTA', nonNumeric: false, label: 'Delta'},
        {type: 'MINIMUM', nonNumeric: false, label: 'Minimum'},
        {type: 'MAXIMUM', nonNumeric: false, label: 'Maximum'},
        {type: 'ACCUMULATOR', nonNumeric: false, label: 'Accumulator'},
        {type: 'SUM', nonNumeric: false, label: 'Sum'},
        {type: 'FIRST', nonNumeric: true, label: 'First'},
        {type: 'LAST', nonNumeric: true, label: 'Last'},
        {type: 'COUNT', nonNumeric: true, label: 'Count'},
        {type: 'INTEGRAL', nonNumeric: false, label: 'Integral'}
        //{name: 'FFT', nonNumeric: false}
    ];
    
    $rootScope.timePeriodTypes = [
        {type: 'SECONDS', label: 'Seconds'},
        {type: 'MINUTES', label: 'Minutes'},
        {type: 'HOURS', label: 'Hours'},
        {type: 'DAYS', label: 'Days'},
        {type: 'WEEKS', label: 'Weeks'},
        {type: 'MONTHS', label: 'Months'},
        {type: 'YEARS', label: 'Years'}
    ];
    
    $rootScope.chartTypes = [
        {type: 'line', label: 'Line'},
        {type: 'smoothedLine', label: 'Smoothed'},
        {type: 'step', label: 'Step'},
        {type: 'column', label: 'Bar'}
    ];
    
    $rootScope.relativeDateTypes = [
        {type: "", label: 'Now'},
        {type: "moment:'subtract':5:'minutes'", label: '5 minutes ago'},
        {type: "moment:'subtract':15:'minutes'", label: '15 minutes ago'},
        {type: "moment:'subtract':30:'minutes'", label: '30 minutes ago'},
        {type: "moment:'subtract':1:'hours'", label: '1 hour ago'},
        {type: "moment:'subtract':3:'hours'", label: '3 hours ago'},
        {type: "moment:'subtract':5:'hours'", label: '6 hours ago'},
        {type: "moment:'subtract':12:'hours'", label: '12 hours ago'},
        {type: "moment:'startOf':'day'", label: 'Start of day'},
        {type: "moment:'subtract':1:'days'|moment:'startOf':'day'", label: 'Start of previous day'},
        {type: "moment:'subtract':1:'days'", label: '1 day ago'},
        {type: "moment:'startOf':'week'", label: 'Start of week'},
        {type: "moment:'subtract':1:'weeks'|moment:'startOf':'week'", label: 'Start of last week'},
        {type: "moment:'subtract':1:'weeks'", label: '1 week ago'},
        {type: "moment:'subtract':2:'weeks'", label: '2 weeks ago'},
        {type: "moment:'startOf':'month'", label: 'Start of month'},
        {type: "moment:'subtract':1:'months'|moment:'startOf':'month'", label: 'Start of last month'},
        {type: "moment:'subtract':1:'months'", label: '1 month ago'},
        {type: "moment:'subtract':3:'months'", label: '3 months ago'},
        {type: "moment:'subtract':6:'months'", label: '6 months ago'},
        {type: "moment:'startOf':'year'", label: 'Start of year'},
        {type: "moment:'subtract':1:'years'|moment:'startOf':'year'", label: 'Start of last year'},
        {type: "moment:'subtract':1:'years'", label: '1 year ago'}
    ];
    
    $rootScope.dateRangePresets = [
        {type: "LAST_5_MINUTES", label: 'Last 5 minutes'},
        {type: "LAST_15_MINUTES", label: 'Last 15 minutes'},
        {type: "LAST_30_MINUTES", label: 'Last 30 minutes'},
        {type: "LAST_1_HOURS", label: 'Last 1 hours'},
        {type: "LAST_3_HOURS", label: 'Last 3 hours'},
        {type: "LAST_6_HOURS", label: 'Last 6 hours'},
        {type: "LAST_12_HOURS", label: 'Last 12 hours'},
        {type: "LAST_1_DAYS", label: 'Last 1 days'},
        {type: "LAST_1_WEEKS", label: 'Last 1 weeks'},
        {type: "LAST_2_WEEKS", label: 'Last 2 weeks'},
        {type: "LAST_1_MONTHS", label: 'Last 1 months'},
        {type: "LAST_3_MONTHS", label: 'Last 3 months'},
        {type: "LAST_6_MONTHS", label: 'Last 6 months'},
        {type: "LAST_1_YEARS", label: 'Last 1 years'},
        {type: "LAST_2_YEARS", label: 'Last 2 years'},
        {type: "DAY_SO_FAR", label: 'Today so far'},
        {type: "WEEK_SO_FAR", label: 'This week so far'},
        {type: "MONTH_SO_FAR", label: 'This month so far'},
        {type: "YEAR_SO_FAR", label: 'This year so far'},
        {type: "PREVIOUS_DAY", label: 'Yesterday'},
        {type: "PREVIOUS_WEEK", label: 'Previous week'},
        {type: "PREVIOUS_MONTH", label: 'Previous month'},
        {type: "PREVIOUS_YEAR", label: 'Previous year'}
    ];
}]);

return maDashboardApp;

}); // require
