/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['amcharts/serial', 'jquery', 'moment', 'amcharts/plugins/export/export'], function(AmCharts, $, moment) {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maSerialChart
 * @restrict E
 * @description
 * `<ma-serial-chart style="height: 300px; width: 100%" series-1-values="point1Values" series-1-point="point1" default-type="column">
</ma-serial-chart>`
 * - The `<ma-serial-chart>` directive allows you to create line and bar charts.
 * - Many different variations on a chart can be created by customizing the attributes.
 * - Values are provided via `<ma-point-values>`. You can provide your time range and rollup settings to `<ma-point-values>`, then pass the data to `<ma-serial-chart>`.
 * - In the attributes starting with `series-X-` you will replace `X` with the series number from 1 to 10
 * - Note, you will need to set a width and height on the element.
 * - <a ui-sref="dashboard.examples.charts.lineChart">View Demo</a> / <a ui-sref="dashboard.examples.charts.advancedChart">View Advanced Demo</a>
 *
 * @param {array} values Inputs an array of value objects generated by `<ma-point-values>`.
 * @param {array=} points Inputs an array of points from `<ma-point-query>`. ([See Example](/modules/dashboards/web/mdAdmin/#/dashboard/examples/point-arrays/point-array-line-chart))
 * @param {string=} time-format The moment.js time format to be used in displaying timestamps on the X axis.
 * @param {string=} timezone The timezone to render the date/time in if the time-format option is specified
 * @param {string=} stack-type Stacking mode of the axis. Possible values are: `"none"`, `"regular"`, `"100%"`, `"3d"`.
 * @param {string=} default-type The type of chart used for all graphs. The possible values for chart type are `"line"`, `"smoothedLine"`, `"column"`, or `"step"`.
 * @param {string=} default-color The default color used for all graphs. Can be a color string or hex value.
 * @param {string=} default-axis The defaults axis used for all graphs. Can be `"right"` or `"left"`.
 * @param {string=} default-balloon-text Overides the balloon text with a specified string.
 * @param {object=} default-graph-options Default config object for the all series, see [AmGraph](https://docs.amcharts.com/javascriptcharts/AmGraph)
 * @param {array} series-X-values Inputs a values array generated by `<ma-point-values>`.
 * @param {object=} series-X-point Inputs a point object from `<ma-point-list>`.
 * @param {string=} series-X-type The type of chart used for the given series (replace `X` with series number starting with 1). The possible values for chart type are `"line"`, `"smoothedLine"`, `"column"`, or `"step"`.
 * @param {string=} series-X-color The default color used for the given series (replace `X` with series number starting with 1). Can be a color string or hex value.
 * @param {string=} series-X-axis The defaults axis used for the given series (replace `X` with series number starting with 1). Can be `"right"` or `"left"`.
 * @param {string=} series-X-balloon-text Overides the balloon text with a specified string for the given series (replace `X` with series number starting with 1).
 * @param {string=} series-X-title Sets the text in the legend for the given series (replace `X` with series number starting with 1).
 * @param {object=} series-X-graph-options Config object for the series, see [AmGraph](https://docs.amcharts.com/javascriptcharts/AmGraph)
 * @param {boolean=} export If set to true, chart export functionality will be turned on. Defaults to off.
 * @param {boolean=} balloon If set to true, chart's cursor and balloon will be turned on. Defaults to off.
 * @param {boolean=} legend If set to true, chart's legend will be turned on. Defaults to off.
 * @param {object=} options extend AmCharts configuration object for customizing design of the chart (see [amCharts](https://docs.amcharts.com/3/javascriptcharts/AmSerialChart))
 * 
 * @usage
 * <ma-serial-chart style="height: 300px; width: 100%" series-1-values="point1Values" series-1-point="point1" default-type="column">
</ma-serial-chart>`
 *
 */
function serialChart(maDashboardsInsertCss, cssInjector) {
	var MAX_SERIES = 10;

	var scope = {
		options: '<?',
	    timeFormat: '@',
        timezone: '@',
	    stackType: '@',
	    values: '<?',
	    points: '<?',
	    graphOptions: '<?',
	    defaultType: '@',
	    defaultColor: '@',
        defaultAxis: '@',
        defaultBalloonText: '@',
        defaultGraphOptions: '<?',
        'export': '<?',
        balloon: '<?',
        legend: '<?'
	};

	for (var j = 1; j <= MAX_SERIES; j++) {
		scope['series' + j + 'Values'] = '<?';
		scope['series' + j + 'Type'] = '@';
		scope['series' + j + 'Title'] = '@';
		scope['series' + j + 'Color'] = '@';
		scope['series' + j + 'Axis'] = '@';
        scope['series' + j + 'BalloonText'] = '@';
        scope['series' + j + 'Point'] = '<?';
        scope['series' + j + 'GraphOptions'] = '<?';
	}

    return {
        restrict: 'E',
        replace: true,
        scope: scope,
        template: '<div class="amchart"></div>',
        compile: function() {
            if (maDashboardsInsertCss) {
                cssInjector.injectLink(require.toUrl('amcharts/plugins/export/export.css'), 'amchartsExport');
            }
            return postLink;
        }
    };
    
    function postLink($scope, $element, attrs) {
            var options = defaultOptions();

            if ($scope.timeFormat) {
                options.categoryAxis.parseDates = false;
            }

            if ($scope.stackType) {
                options.valueAxes[0].stackType = $scope.stackType;
            }
            
            if ($scope.legend) {
                options.legend = {};
            }
            
            if ($scope['export']) {
                options['export'].enabled = true;
            }
            
            if ($scope.balloon) {
                options.chartCursor = {categoryBalloonDateFormat:'YYYY-MM-DD HH:NN', oneBalloonOnly: true};
            }

            var valueArray = !!attrs.values;

            $.extend(true, options, $scope.options);

            var chart = AmCharts.makeChart($element[0], options);

            $scope.$watch('options', function(newValue, oldValue) {
            	if (newValue === undefined) return;
            	$.extend(true, chart, newValue);
            	chart.validateNow();
            }, true);

            $scope.$watchGroup([
                'defaultType',
                'defaultColor',
                'defaultAxis',
                'defaultBalloonText',
                'defaultGraphOptions'
            ], graphOptionsChanged.bind(null, null));

            if (valueArray) {
            	$scope.$watchCollection('values', watchValues);
            	$scope.$watchCollection('points', watchPoints);
            }
            
            for (var i = 1; i <= MAX_SERIES; i++) {
                var seriesAttributes = [
                    'series' + i + 'Type',
                    'series' + i + 'Title',
                    'series' + i + 'Color',
                    'series' + i + 'Axis',
                    'series' + i + 'BalloonText',
                    'series' + i + 'GraphOptions'
                ];
                
                if (!valueArray) {
                    seriesAttributes.push('series' + i + 'Values');
                    seriesAttributes.push('series' + i + 'Point');
                }
                
                var hasSeries = false;
                for (var j = 0; j < seriesAttributes.length; j++) {
                    if (!angular.isUndefined(attrs[seriesAttributes[j]])) {
                        hasSeries = true;
                        break;
                    }
                }
                
                if (hasSeries) {
                    $scope.$watchGroup(seriesAttributes, graphOptionsChanged.bind(null, i));
                    if (!valueArray) {
                        $scope.$watchCollection('series' + i + 'Values', valuesChanged.bind(null, i));
                    }
                }
            }

            function watchValues(newValues, oldValues) {
                chart.dataProvider = newValues;
                chart.validateData();
            }

            function watchPoints(newPoints, oldPoints) {
            	var i, point, graphNum;
            	chart.graphs = [];

            	if (newPoints) {
	            	for (i = 0; i < newPoints.length; i++) {
	            		point = newPoints[i];
	            		if (!point) continue;
	            		setupGraph(i + 1, point);
	            	}
            	}

            	sortGraphs();
                chart.validateData();
            }

            function findGraph(propName, prop, removeGraph) {
                for (var i = 0; i < chart.graphs.length; i++) {
                    if (chart.graphs[i][propName] === prop) {
                    	var graph = chart.graphs[i];
                    	if (removeGraph) chart.graphs.splice(i, 1);
                    	return graph;
                    }
                }
            }

            function graphOptionsChanged(graphNum, values) {
            	if (isAllUndefined(values)) return;

            	if (graphNum === null) {
            	    // update all graphs
            	    for (var i = 0; i < chart.graphs.length; i++) {
            	        setupGraph(chart.graphs[i]);
            	    }
            	} else {
            	    setupGraph(graphNum);
            	}

            	sortGraphs();
            	chart.validateData();
            }

            function valuesChanged(graphNum, newValues, oldValues) {
            	if (newValues === oldValues && newValues === undefined) return;

            	if (!newValues) {
            		findGraph('graphNum', graphNum, true);
            	} else  {
                	setupGraph(graphNum);
                	sortGraphs();
                }
                updateValues();
            }
            
            function getPointForGraph(graphNum) {
                var point = $scope['series' + graphNum + 'Point'];
                if (!point && $scope.points) {
                    point = $scope.points[graphNum - 1];
                }
                return point;
            }

            function setupGraph(graphNum, point) {
                var graph;

                // first arg can be the graph itself
                if (typeof graphNum === 'object') {
                    graph = graphNum;
                    graphNum = graph.graphNum;
                } else {
                    graph = findGraph('graphNum', graphNum);
                }
                if (!graph) {
                    graph = {};
                    chart.graphs.push(graph);
                }
                
            	var hardDefaults = {
            	    graphNum: graphNum,
        	        id: 'series-' + graphNum,
                    valueField: 'value_' + graphNum,
                    title: 'Series ' + graphNum,
                    type: 'smoothedLine',
                    valueAxis: 'left',
                    balloonText: '[[value]]'
            	};

            	var pointDefaults;
                point = point || getPointForGraph(graphNum);
            	if (point) {
            	    pointDefaults = {
            	        xid: point.xid,
            	        valueField: 'value_' + point.xid,
            	        title: point.deviceName + ' - ' + point.name,
            	        type: point.plotType && point.plotType.toLowerCase(),
            	        lineColor: point.chartColour
                	};
            	    
            	    // change mango plotType to amCharts graphType
                    // step and line are equivalent
                    if (pointDefaults.type === 'spline') {
                        pointDefaults.type = 'smoothedLine';
                    }
            	};

                var defaultAttributes = {
                    type: $scope.defaultType,
                    lineColor: $scope.defaultColor,
                    valueAxis: $scope.defaultAxis,
                    balloonText: $scope.defaultBalloonText
                };
                
            	var attributeOptions = {
        	        title: $scope['series' + graphNum + 'Title'],
        	        type: $scope['series' + graphNum + 'Type'],
        	        lineColor: $scope['series' + graphNum + 'Color'],
                    valueAxis: $scope['series' + graphNum + 'Axis'],
                    balloonText: $scope['series' + graphNum + 'BalloonText']
            	};
            	
            	var graphOptions = $scope['series' + graphNum + 'GraphOptions'] ||
            	    ($scope.graphOptions && $scope.graphOptions[graphNum - 1]);

                var opts = $.extend(true, {}, hardDefaults, pointDefaults, $scope.defaultGraphOptions, defaultAttributes, attributeOptions, graphOptions);
                if (angular.isUndefined(opts.fillAlphas)) {
                    opts.fillAlphas = opts.type === 'column' ? 0.7 : 0;
                    var firstAxis = options.valueAxes[0];
                    if (opts.valueAxis === 'left' && firstAxis && firstAxis.id === 'left' && firstAxis.stackType && firstAxis.stackType !== 'none') {
                        opts.fillAlphas = 0.7;
                    }
                }
                if (angular.isUndefined(opts.lineThickness)) {
                    opts.lineThickness = opts.type === 'column' ? 1.0 : 2.0;
                }
                $.extend(true, graph, opts);
            }

            function sortGraphs() {
            	chart.graphs.sort(function(a, b) {
                    return a.graphNum - b.graphNum;
                });
            }

            function combine(output, newValues, valueField) {
                if (!newValues) return;

                for (var i = 0; i < newValues.length; i++) {
                    var value = newValues[i];
                    var timestamp;
                    if ($scope.timeFormat) {
                        var m = $scope.timezone ? moment.tz(value.timestamp, $scope.timezone) : moment(value.timestamp);
                        timestamp = m.format($scope.timeFormat);
                    } else {
                        timestamp = value.timestamp;
                    }

                    if (!output[timestamp]) {
                        output[timestamp] = {timestamp: timestamp};
                    }

                    output[timestamp][valueField] = value.value;
                }
            }

            function updateValues() {
            	var values = $scope.timeFormat ? {} : [];

            	for (var i = 1; i <= MAX_SERIES; i++) {
            		var seriesValues = $scope['series' + i + 'Values'];

            		var point = getPointForGraph(i);
            		var valueField = 'value_' + (point ? point.xid : i);
            		
            		combine(values, seriesValues, valueField);
            	}

                // normalize sparse array or object into dense array
                var output = [];
                for (var timestamp in values) {
                    output.push(values[timestamp]);
                }

                // XXX sparse array to dense array doesnt result in sorted array
                // manually sort here
                if (output.length && typeof output[0].timestamp === 'number') {
                    output.sort(function(a,b) {
                        return a.timestamp - b.timestamp;
                    });
                }

                chart.dataProvider = output;
                chart.validateData();
            }

            function isAllUndefined(a) {
            	for (var i = 0; i < a.length; i++) {
            		if (a[i] !== undefined) return false;
            	}
            	return true;
            }
        }
}

serialChart.$inject = ['maDashboardsInsertCss', 'cssInjector'];

function defaultOptions() {
    return {
        type: "serial",
        theme: "light",
        addClassNames: true,
        dataProvider: [],
        valueAxes: [{
        	id: "left",
            position: "left"
        },{
        	id: "right",
            position: "right"
        },{
        	id: "left-2",
            position: "left",
            offset: 50
        },{
        	id: "right-2",
            position: "right",
            offset: 50
        }],
        categoryAxis: {
            parseDates: true,
            minPeriod: 'fff',
            equalSpacing: true
        },
        startDuration: 0,
        graphs: [],
        plotAreaFillAlphas: 0.0,
        categoryField: "timestamp",
        'export': {
            enabled: false,
            libs: {autoLoad: false}
        }
    };
}

return serialChart;

}); // define
