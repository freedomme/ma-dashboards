/**
 * Copyright (C) 2016 Deltamation Software. All rights reserved.
 * http://www.deltamation.com.au/
 * 
 * @author Jared Wiltshire
 */

require([
    'angular',
    'mango-3.0/maDashboards',
    'mango-3.0/maAppComponents',
    'angular-ui-router',
    'oclazyload',
    'angular-loading-bar',
    'angular-material'
], function(angular, maDashboards, maAppComponents) {
'use strict';

var mdAdminApp = angular.module('mdAdminApp', [
    'oc.lazyLoad',
    'ui.router',
    'angular-loading-bar',
    'maDashboards',
    'maAppComponents',
    'ngMaterial',
    'ngMessages'
]);

mdAdminApp.constant('PAGES', [
    {
        state: 'dashboard',
        url: '/dashboard',
        templateUrl: 'views/dashboard/main.html',
        resolve: {
            auth: ['$rootScope', 'User', function($rootScope, User) {
                $rootScope.user = User.current();
                return $rootScope.user.$promise;
            }],
            loadMyDirectives: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name: 'mdAdminApp',
                    files: ['directives/sidebar-date-controls/sidebar-date-controls.js',
                            'directives/menu/menuLink.js',
                            'directives/menu/menuToggle.js']
                });
            }]
        }
    },
    {
        state: 'login',
        url: '/login',
        templateUrl: 'views/login.html',
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load('directives/login/login.js');
            }]
        }
    },
    {
        state: 'dashboard.home',
        url: '/home',
        templateUrl: 'views/dashboard/home.html',
        menuTr: 'dashboards.v3.dox.home',
        menuIcon: 'fa fa-home',
        menuType: 'link'
    },
    {
        url: '/examples',
        state: 'dashboard.examples',
        resolve: {
            loadMyFile: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name: 'ace',
                    files: ['../vendor/ace/ace.js']
                }).then(function() {
                    return $ocLazyLoad.load({
                        name: 'ui-ace',
                        files: ['../vendor/angular-ui-ace/ui-ace.js']
                    });
                }).then(function() {
                    return $ocLazyLoad.load([
                        'directives/liveEditor/liveEditor.js',
                        'directives/liveEditor/livePreview.js',
                        'directives/liveEditor/dualPaneEditor.js',
                        'styles/examples.css'
                    ]);
                });
            }]
        }
    },
    {
        url: '/play-area',
        state: 'dashboard.examples.playArea',
        templateUrl: 'views/examples/playArea.html',
        menuTr: 'dashboards.v3.dox.playArea',
        menuIcon: 'fa fa-magic',
        menuType: 'link'
    },
    {
        state: 'dashboard.examples.playAreaBig',
        templateUrl: 'views/examples/playAreaBig.html',
        url: '/play-area-big'
    },
    {
        state: 'dashboard.examples.basics',
        url: '/basics',
        menuTr: 'dashboards.v3.dox.basics',
        menuIcon: 'fa fa-info-circle',
        menuType: 'toggle',
        children: [
            {
                state: 'dashboard.examples.basics.angular',
                templateUrl: 'views/examples/angular.html',
                url: '/angular',
                menuTr: 'dashboards.v3.dox.angular',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.basics.pageTemplate',
                templateUrl: 'views/examples/pageTemplate.html',
                url: '/page-template',
                menuTr: 'dashboards.v3.dox.pageTemplate',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.basics.pointList',
                templateUrl: 'views/examples/pointList.html',
                url: '/point-list',
                menuTr: 'dashboards.v3.dox.pointList',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.basics.liveValues',
                templateUrl: 'views/examples/liveValues.html',
                url: '/live-values',
                menuTr: 'dashboards.v3.dox.liveValues',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.basics.filters',
                templateUrl: 'views/examples/filters.html',
                url: '/filters',
                menuTr: 'dashboards.v3.dox.filters',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.basics.datePresets',
                templateUrl: 'views/examples/datePresets.html',
                url: '/date-presets',
                menuTr: 'dashboards.v3.dox.datePresets',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.basics.pointValues',
                templateUrl: 'views/examples/pointValues.html',
                url: '/point-values',
                menuTr: 'dashboards.v3.dox.pointValues',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.basics.getPointByXid',
                templateUrl: 'views/examples/getPointByXid.html',
                url: '/get-point-by-xid',
                menuTr: 'dashboards.v3.dox.getPointByXid',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.basics.translation',
                templateUrl: 'views/examples/translation.html',
                url: '/translation',
                menuTr: 'dashboards.v3.dox.translation',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.basics.latestPointValues',
                templateUrl: 'views/examples/latestPointValues.html',
                url: '/latest-point-values',
                menuTr: 'dashboards.v3.dox.latestPointValues',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.basics.jsonStore',
                templateUrl: 'views/examples/jsonStore.html',
                url: '/json-store',
                menuTr: 'dashboards.v3.dox.jsonStore',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.basics.watchdog',
                templateUrl: 'views/examples/watchdog.html',
                url: '/watchdog',
                menuTr: 'dashboards.v3.dox.watchdog',
                menuType: 'link'
            }
        ]
    },
    {
        state: 'dashboard.examples.singleValueDisplays',
        url: '/single-value-displays',
        menuTr: 'dashboards.v3.dox.singleValueDisplays',
        menuIcon: 'fa fa-tachometer',
        menuType: 'toggle',
        children: [
            {
                state: 'dashboard.examples.singleValueDisplays.gauges',
                templateUrl: 'views/examples/gauges.html',
                url: '/gauges',
                menuTr: 'dashboards.v3.dox.gauges',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.singleValueDisplays.switchImage',
                templateUrl: 'views/examples/switchImage.html',
                url: '/switch-image',
                menuTr: 'dashboards.v3.dox.switchImage',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.singleValueDisplays.bars',
                templateUrl: 'views/examples/bars.html',
                url: '/bars',
                menuTr: 'dashboards.v3.dox.bars',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.singleValueDisplays.tanks',
                templateUrl: 'views/examples/tanks.html',
                url: '/tanks',
                menuTr: 'dashboards.v3.dox.tanks',
                menuType: 'link'
            }
        ]
    },
    {
        state: 'dashboard.examples.charts',
        url: '/charts',
        menuTr: 'dashboards.v3.dox.charts',
        menuIcon: 'fa fa-area-chart',
        menuType: 'toggle',
        children: [
            {
                state: 'dashboard.examples.charts.lineChart',
                templateUrl: 'views/examples/lineChart.html',
                url: '/line-chart',
                menuTr: 'dashboards.v3.dox.lineChart',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.charts.barChart',
                templateUrl: 'views/examples/barChart.html',
                url: '/bar-chart',
                menuTr: 'dashboards.v3.dox.barChart',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.charts.advancedChart',
                templateUrl: 'views/examples/advancedChart.html',
                url: '/advanced-chart',
                menuTr: 'dashboards.v3.dox.advancedChart',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.charts.stateChart',
                templateUrl: 'views/examples/stateChart.html',
                url: '/state-chart',
                menuTr: 'dashboards.v3.dox.stateChart',
                menuType: 'link'
            }
        ]
    },
    {
        state: 'dashboard.examples.statistics',
        url: '/statistics',
        menuTr: 'dashboards.v3.dox.statistics',
        menuIcon: 'fa fa-table',
        menuType: 'toggle',
        children: [
            {
                state: 'dashboard.examples.statistics.getStatistics',
                templateUrl: 'views/examples/getStatistics.html',
                url: '/get-statistics',
                menuTr: 'dashboards.v3.dox.getStatistics',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.statistics.statisticsTable',
                templateUrl: 'views/examples/statisticsTable.html',
                url: '/statistics-table',
                menuTr: 'dashboards.v3.dox.statisticsTable',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.statistics.statePieChart',
                templateUrl: 'views/examples/statePieChart.html',
                url: '/state-pie-chart',
                menuTr: 'dashboards.v3.dox.statePieChart',
                menuType: 'link'
            }
        ]
    },
    {
        state: 'dashboard.examples.pointArrays',
        url: '/point-arrays',
        menuTr: 'dashboards.v3.dox.pointArrayTemplating',
        menuIcon: 'fa fa-list',
        menuType: 'toggle',
        children: [
            {
                state: 'dashboard.examples.pointArrays.pointArrayTable',
                templateUrl: 'views/examples/pointArrayTable.html',
                url: '/point-array-table',
                menuTr: 'dashboards.v3.dox.pointArrayTable',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.pointArrays.pointArrayLineChart',
                templateUrl: 'views/examples/pointArrayLineChart.html',
                url: '/point-array-line-chart',
                menuTr: 'dashboards.v3.dox.pointArrayLineChart',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.pointArrays.templating',
                templateUrl: 'views/examples/templating.html',
                url: '/templating',
                menuTr: 'dashboards.v3.dox.templating',
                menuType: 'link'
            }
        ]
    },
    {
        state: 'dashboard.examples.settingPointValues',
        url: '/setting-point-values',
        menuTr: 'dashboards.v3.dox.settingPoint',
        menuIcon: 'fa fa-pencil-square-o',
        menuType: 'toggle',
        children: [
            {
                state: 'dashboard.examples.settingPointValues.setPoint',
                templateUrl: 'views/examples/setPoint.html',
                url: '/set-point',
                menuTr: 'dashboards.v3.dox.settingPoint',
                menuType: 'link'
            },
            {
                state: 'dashboard.examples.settingPointValues.toggle',
                templateUrl: 'views/examples/toggle.html',
                url: '/toggle',
                menuTr: 'dashboards.v3.dox.toggle',
                menuType: 'link'
            }
        ]
    }
]);

mdAdminApp.config([
    'PAGES',
    '$stateProvider',
    '$urlRouterProvider',
    '$ocLazyLoadProvider',
    '$httpProvider',
    '$mdThemingProvider',
function(PAGES, $stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $httpProvider, $mdThemingProvider) {

    $mdThemingProvider
        .theme('default')
        .primaryPalette("orange")
        .accentPalette('indigo')
        .warnPalette('red');
    
    $httpProvider.interceptors.push('errorInterceptor');

    $ocLazyLoadProvider.config({
        debug: false,
        events: true,
    });

    $urlRouterProvider.otherwise('/dashboard/home');
    
    addStates(PAGES);
    
    function addStates(pages, parent) {
        angular.forEach(pages, function(page, area) {
            if (page.state) {
                var state = {
                    url: page.url
                }
                
                if (page.menuTr) {
                    state.menuTr = page.menuTr
                }
                
                if (parent) {
                    state.parentPage = parent;
                }
                
                if (page.templateUrl) {
                    state.templateUrl = page.templateUrl;
                } else {
                    state.template = '<ui-view/>';
                    state['abstract'] = true;
                }
                
                if (page.resolve) {
                    state.resolve = page.resolve;
                }
                
                $stateProvider.state(page.state, state);
            }
            
            addStates(page.children, page);
        });
    }
}]);

mdAdminApp.run([
    'PAGES',
    '$rootScope',
    '$state',
    '$timeout',
    '$mdSidenav',
function(PAGES, $rootScope, $state, $timeout, $mdSidenav) {
    $rootScope.pages = PAGES;
    $rootScope.Math = Math;

    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
        if (error && (error.status === 401 || error.status === 403)) {
            event.preventDefault();
            $state.loginRedirect = toState;
            $state.go('login');
        }
    });

    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
        var crumbs = [];
        var state = toState;
        do {
            if (state.menuTr) {
                crumbs.unshift(state.menuTr);
            }
        } while (state = state.parentPage);
        $rootScope.crumbs = crumbs;
        $rootScope.closeMenu();
    });

    $rootScope.closeMenu = function() {
        $timeout(function() {
            $mdSidenav('left').close();
        });
    }

    $rootScope.openMenu = function() {
        $timeout(function() {
            $mdSidenav('left').open();
        });
    }

}]);

angular.element(document).ready(function() {
    angular.bootstrap(document.documentElement, ['mdAdminApp']);
});

}); // require
