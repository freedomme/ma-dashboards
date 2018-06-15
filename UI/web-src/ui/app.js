/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import '../ngMango/ngMangoMaterial';
import menuProvider from './services/menu';
import pagesFactory from './services/pages';
import dateBarFactory from './services/dateBar';
import uiSettingsFactory from './services/uiSettings';
import pageView from './directives/pageView/page_view';
import livePreview from './directives/liveEditor/livePreview';
import stateParams from './directives/stateParams/stateParams';
import iframeView from './directives/iframeView/iframeView';
import menuItems from './menuItems';
import 'moment-timezone';
import 'angular-ui-router';
import 'angular-ui-sortable';
import 'angular-loading-bar';
import '../docs/ngMango/js/docs-setup';
import 'md-color-picker';
import defaultUiSettings from './uiSettings.json';
import {require as requirejs} from 'requirejs';
import {moduleVersions} from '../shims/exportAMD.js';

import 'angular-loading-bar/build/loading-bar.css';
import 'md-color-picker/dist/mdColorPicker.css';
import './styles/fonts.css';
import './styles/main.css';

// must match variables defined in UIInstallUpgrade.java
const MA_UI_MENU_XID = 'mangoUI-menu';
const MA_UI_PAGES_XID = 'mangoUI-pages';
const MA_UI_SETTINGS_XID = 'mangoUI-settings';
const MA_UI_EDIT_MENUS_PERMISSION = 'edit-ui-menus';
const MA_UI_EDIT_PAGES_PERMISSION = 'edit-ui-pages';
const MA_UI_EDIT_SETTINGS_PERMISSION = 'edit-ui-settings';

const uiApp = angular.module('maUiApp', [
    'ui.router',
    'ui.sortable',
    'angular-loading-bar',
    'ngMangoMaterial',
    'ngMessages',
    'mdColorPicker'
]);

uiApp.provider('maUiMenu', menuProvider)
    .factory('maUiPages', pagesFactory)
    .factory('maUiDateBar', dateBarFactory)
    .factory('maUiSettings', uiSettingsFactory)
    .directive('maUiPageView', pageView)
    .directive('maUiLivePreview', livePreview)
    .directive('maUiStateParams', stateParams)
    .directive('maUiIframeView', iframeView)
    .constant('MA_UI_MENU_XID', MA_UI_MENU_XID)
    .constant('MA_UI_PAGES_XID', MA_UI_PAGES_XID)
    .constant('MA_UI_SETTINGS_XID', MA_UI_SETTINGS_XID)
    .constant('MA_UI_EDIT_MENUS_PERMISSION', MA_UI_EDIT_MENUS_PERMISSION)
    .constant('MA_UI_EDIT_PAGES_PERMISSION', MA_UI_EDIT_PAGES_PERMISSION)
    .constant('MA_UI_EDIT_SETTINGS_PERMISSION', MA_UI_EDIT_SETTINGS_PERMISSION)
    .constant('MA_UI_NG_DOCS', window.NG_DOCS)
    .constant('MA_UI_MENU_ITEMS', menuItems);


// override constant from ngMango module
uiApp.constant('MA_EVENT_LINK_INFO', {
    DATA_POINT: {
        icon: 'timeline',
        tooltipTranslation: 'ui.app.dpd',
        stateName: 'ui.dataPointDetails',
        stateParams: event => {
            return { pointId: event.eventType.dataPointId };
        }
    },
    DATA_SOURCE: {
        icon: 'device_hub',
        tooltipTranslation: 'header.dataSources',
        stateName: 'ui.settings.dataSources',
        stateParams: event => {
            return { dataSourceId: event.eventType.dataSourceId };
        }
    },
    LICENSE_CHECK: {
        icon: 'extension',
        tooltipTranslation: 'header.modules',
        stateName: 'ui.settings.modules',
        stateParams: event => {
            return {};
        }
    }
});

uiApp.config([
    'MA_UI_SETTINGS',
    'MA_UI_NG_DOCS',
    '$stateProvider',
    '$urlRouterProvider',
    '$httpProvider',
    '$mdThemingProvider',
    '$injector',
    '$compileProvider',
    'maUiMenuProvider',
    '$locationProvider',
    '$mdAriaProvider',
    'cfpLoadingBarProvider',
    'maSystemSettingsProvider',
    'MA_UI_MENU_XID',
    'MA_UI_PAGES_XID',
    'maRequireQProvider',
function(MA_UI_SETTINGS, MA_UI_NG_DOCS, $stateProvider, $urlRouterProvider,
        $httpProvider, $mdThemingProvider, $injector, $compileProvider, MenuProvider, $locationProvider, $mdAriaProvider,
        cfpLoadingBarProvider, SystemSettingsProvider, MA_UI_MENU_XID, MA_UI_PAGES_XID, maRequireQProvider) {

    $compileProvider.debugInfoEnabled(false);
    $compileProvider.commentDirectivesEnabled(false);
    // we use the a class directive to transform ngDoc divs with class="prettyprint"
    //$compileProvider.cssClassDirectivesEnabled(false);
    
    $mdAriaProvider.disableWarnings();
    maRequireQProvider.setRequireJs(requirejs);

    if (MA_UI_SETTINGS.palettes) {
        for (const paletteName in MA_UI_SETTINGS.palettes) {
            $mdThemingProvider.definePalette(paletteName, angular.copy(MA_UI_SETTINGS.palettes[paletteName]));
        }
    }

    if (MA_UI_SETTINGS.themes) {
        for (const name in MA_UI_SETTINGS.themes) {
            const themeSettings = MA_UI_SETTINGS.themes[name];
            const theme = $mdThemingProvider.theme(name);
            if (themeSettings.primaryPalette) {
                theme.primaryPalette(themeSettings.primaryPalette, themeSettings.primaryPaletteHues);
            }
            if (themeSettings.accentPalette) {
                theme.accentPalette(themeSettings.accentPalette, themeSettings.accentPaletteHues);
            }
            if (themeSettings.warnPalette) {
                theme.warnPalette(themeSettings.warnPalette, themeSettings.warnPaletteHues);
            }
            if (themeSettings.backgroundPalette) {
                theme.backgroundPalette(themeSettings.backgroundPalette, themeSettings.backgroundPaletteHues);
            }
            if (themeSettings.dark) {
                theme.dark();
            }
        }
    }

    // need to store a reference to the theming provider in order to generate themes at runtime
    MA_UI_SETTINGS.themingProvider = $mdThemingProvider;

    const defaultTheme = MA_UI_SETTINGS.defaultTheme || 'mangoDark';
    $mdThemingProvider.setDefaultTheme(defaultTheme);
    $mdThemingProvider.alwaysWatchTheme(true);
    $mdThemingProvider.generateThemesOnDemand(true);
    $mdThemingProvider.enableBrowserColor({
        theme: defaultTheme
    });

    $httpProvider.useApplyAsync(true);

    if ($injector.has('$mdpTimePickerProvider')) {
        /*
        const $mdpTimePickerProvider = $injector.get('$mdpTimePickerProvider');
        $mdpTimePickerProvider.setOKButtonLabel();
        $mdpTimePickerProvider.setCancelButtonLabel();
        */
    }

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise(function($injector, $location) {
        const basePath = '/ui/';
        const User = $injector.get('maUser');
        const $state = $injector.get('$state');
        const user = User.current;
        
        let path = basePath;
        if ($location.path()) {
            path += $location.path().substring(1);
        }
        
        if (!user) {
            $state.loginRedirectUrl = path;
            return '/login';
        }
        
        if (path === basePath) {
            // mango default URI will contain the homeUrl if it exists, or the mango start page if it doesn't
            // so prefer using it if it exists (only exists when doing login)
            const homeUrl = user.mangoDefaultUri || user.homeUrl;
            if (homeUrl && homeUrl.indexOf(basePath) === 0) {
                return '/' + homeUrl.substring(basePath.length); // strip basePath from start of URL
            }
            return user.admin ? '/administration/home' : '/data-point-details/';
        }

        return '/not-found?path=' + encodeURIComponent(path);
    });

    const apiDocsMenuItems = [];
    const docsParent = {
        name: 'ui.docs',
        url: '/docs',
        menuTr: 'ui.dox.apiDocs',
        menuIcon: 'book',
        menuHidden: true,
        submenu: true,
        weight: 2002,
        resolve: {
            prettyprint: ['$injector', function($injector) {
                return import(/* webpackChunkName: "ui.docs" */
                        './directives/prettyprint/prettyprint').then(prettyprint => {
                    angular.module('maUiDocsState', [])
                        .directive('prettyprint', prettyprint.default); // cant name this directive maUiPrettyPrint as its a class added by ngDoc
                    $injector.loadNewModules(['maUiDocsState']);
                });
            }]
        },
        params: {
            sidebar: null
        }
    };
    apiDocsMenuItems.push(docsParent);

    const DOCS_PAGES = MA_UI_NG_DOCS.pages;

    // Loop through and create array of children based on moduleName
    const modules = DOCS_PAGES.map(function(page) {
        return page.moduleName;
    }).filter(function(item, index, array) {
        return index === array.indexOf(item);
    });

    // Create module menu items & states
    modules.forEach(function(item, index, array) {
        const dashCaseUrl = item.replace(/[A-Z]/g, function(c) { return '-' + c.toLowerCase(); });

        let menuProperty = 'menuTr';
        let menuValue;
        
        if (item === 'ngMango') {
            menuValue = 'ui.dox.components';
        } else if (item === 'ngMangoFilters') {
            menuValue = 'ui.dox.filters';
        } else if (item === 'ngMangoServices') {
            menuValue = 'ui.dox.services';
        } else {
            menuValue = item;
            menuProperty = 'menuText';
        }

        apiDocsMenuItems.push({
            name: 'ui.docs.' + item,
            url: '/' + dashCaseUrl,
            [menuProperty]: menuValue
        });
    });

    // Create 3rd level directives/services/filters docs pages
    // First remove module items
    const components = DOCS_PAGES.map(function(page) {
        return page.id;
    }).filter(function(item, index, array) {
        return item.indexOf('.') !== -1;
    });

    // Add each component item
    components.forEach(function(item, index, array) {
        const matches = /^(.+?)\.(.+?)(?::(.+?))?$/.exec(item);
        if (matches) {
            const moduleName = matches[1];
            const serviceName = matches[2];
            let directiveName;
            if (matches.length > 3)
                directiveName = matches[3];
            
            const name = directiveName || serviceName;
            
            let dashCaseUrl = name.replace(/[A-Z]/g, function(c) {
                return '-' + c.toLowerCase();
            });
            
            while (dashCaseUrl.charAt(0) === '-') {
                dashCaseUrl = dashCaseUrl.slice(1);
            }

            let templateUrl = moduleName + '.' + serviceName;
            if (directiveName) templateUrl += '.' + directiveName;

            const menuItem = {
                name: 'ui.docs.' + moduleName + '.' + name,
                url: '/' + dashCaseUrl,
                menuText: name,
                resolve: {
                    viewTemplate: function() {
                        return import(/* webpackMode: "lazy-once", webpackChunkName: "ui.docs" */
                                '../docs/ngMango/partials/api/' + templateUrl + '.html');
                    }
                }
            };
            apiDocsMenuItems.push(menuItem);
        }
    });
    
    MenuProvider.registerMenuItems(apiDocsMenuItems);

    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
}]);

uiApp.run([
    '$rootScope',
    '$state',
    '$timeout',
    '$mdSidenav',
    '$mdMedia',
    'localStorageService',
    '$mdToast',
    'maUser',
    'maUiSettings',
    'maTranslate',
    '$location',
    '$stateParams',
    'maUiDateBar',
    '$document',
    '$mdDialog',
    'maWebAnalytics',
    'MA_GOOGLE_ANALYTICS_PROPERTY_ID',
    '$window',
    'maModules',
    'maMath',
    '$log',
    '$templateCache',
    '$exceptionHandler',
function($rootScope, $state, $timeout, $mdSidenav, $mdMedia, localStorageService,
        $mdToast, User, uiSettings, Translate, $location, $stateParams, maUiDateBar, $document, $mdDialog,
        webAnalytics, MA_GOOGLE_ANALYTICS_PROPERTY_ID, $window, maModules, mathjs, $log, $templateCache, $exceptionHandler) {

    if (MA_GOOGLE_ANALYTICS_PROPERTY_ID) {
        webAnalytics.enableGoogleAnalytics(MA_GOOGLE_ANALYTICS_PROPERTY_ID);
    }

    uiSettings.generateTheme();
    $rootScope.stateParams = $stateParams;
    $rootScope.dateBar = maUiDateBar;
    $rootScope.uiSettings = uiSettings;
    $rootScope.User = User;
    $rootScope.Math = Math;
    $rootScope.mathjs = mathjs;
    $rootScope.$mdMedia = $mdMedia;
    $rootScope.$state = $state;
    $rootScope.pageOpts = {};
    $rootScope.$log = $log;

    $rootScope.openHelp = function(helpPageState) {
        if (!helpPageState && $state.params.helpPage) {
            helpPageState = $state.get($state.params.helpPage);
        }
        
        if (!helpPageState) {
            $rootScope.closeHelp();
            return;
        }
        
        if (helpPageState.templateUrl) {
            this.pageOpts.helpUrl = helpPageState.templateUrl;
        } else if (helpPageState.resolve && helpPageState.resolve.viewTemplate) {
            const templateUrl = helpPageState.name + '.tmpl.html';

            if ($templateCache.get(templateUrl)) {
                // already in the cache just load the template URL
                $rootScope.pageOpts.helpUrl = templateUrl;
            } else {
                // load the view template via the resolve promise
                helpPageState.resolve.viewTemplate().then((viewTemplate) => {
                    // resolve promise is a ES6 promise not AngularJS $q promise, call $apply
                    $rootScope.$apply(() => {
                        const template = viewTemplate.default;
    
                        // put the template in the cache and then set the help url
                        $templateCache.put(templateUrl, template);
                        
                        helpPageState.templateUrl = templateUrl;
                        delete helpPageState.templateProvider;
                        delete helpPageState.resolve.viewTemplate;

                        $rootScope.pageOpts.helpUrl = templateUrl;
                    });
                });
            }
        }
    };
    
    $rootScope.closeHelp = function() {
        $rootScope.pageOpts.helpUrl = null;
    };
    
    $rootScope.scrollHelp = function() {
        const helpMdContent = document.querySelector('.ma-help-sidebar md-content');
        if (helpMdContent) {
            helpMdContent.scrollTop = 0;
            
            // if help pane contains the hash element scroll to it
            const hash = $location.hash();
            if (hash && helpMdContent.querySelector('#' + hash)) {
//                $anchorScroll();
            }
        }
    };

    $rootScope.titleSuffix = 'Mango v3';
    $rootScope.setTitleText = function setTitleText() {
        if ($state.$current.menuText) {
            this.titleText = $state.$current.menuText + ' - ' + this.titleSuffix;
        } else if ($state.$current.menuTr) {
            Translate.tr($state.$current.menuTr).then(function(text) {
                this.titleText = text + ' - ' + this.titleSuffix;
            }.bind(this), function() {
                this.titleText = this.titleSuffix;
            }.bind(this));
        } else {
            this.titleText = this.titleSuffix;
        }
    };
    
    $rootScope.goToState = function($event, stateName, stateParams) {
        // ignore if it was a middle click, i.e. new tab
        if ($event.which !== 2) {
            $event.preventDefault();
            $state.go(stateName, stateParams);
        }
    };

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        event.preventDefault();
        if (error && (error === 'No user' || error.status === 401 || error.status === 403)) {
            $state.loginRedirectUrl = $state.href(toState, toParams);
            $state.go('login');
        } else {
            $exceptionHandler(error, 'Error transitioning to state ' + (toState && toState.name));

            if (toState.name !== 'ui.error') {
                $state.go('ui.error', {toState, toParams, fromState, fromParams, error});
            }
        }
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        if (toState.href) {
            event.preventDefault();
            $window.open(toState.href, toState.target || '_self');
            return;
        }
        
        if ($state.includes('ui') && !$rootScope.navLockedOpen) {
            $rootScope.closeMenu();
        }
        
        if (toState.name === 'logout') {
            event.preventDefault();
            User.logout().$promise.then(null, function() {
                // consume error
            }).then(function() {
                $state.go('login');
            });
        }

        if (toState.name === 'ui.settings.system') {
            event.preventDefault();
            $state.go('ui.settings.system.systemInformation', toParams);
        }

        if (toState.name === 'ui.settings.systemStatus') {
            event.preventDefault();
            $state.go('ui.settings.systemStatus.loggingConsole', toParams);
        }

        if (toState.name.indexOf('ui.help.') === 0 || toState.name.indexOf('ui.docs.') === 0) {
            const linkBetweenPages = toState.name.indexOf('ui.help.') === 0 && $state.includes('ui.help') ||
                toState.name.indexOf('ui.docs.') === 0 && $state.includes('ui.docs');

            const openInSidebar = $state.includes('ui') && (toParams.sidebar != null ? toParams.sidebar : !linkBetweenPages);
            if (openInSidebar) {
                // stay on current page and load help page into sidebar
                event.preventDefault();
                $rootScope.openHelp(toState);
            } else {
                $rootScope.closeHelp();
            }
        }
    });
    
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        const crumbs = [];
        let state = $state.$current;
        do {
            if (state.name === 'ui') continue;
            
            if (state.menuTr) {
                crumbs.unshift({stateName: state.name, maTr: state.menuTr});
            } else if (state.menuText) {
                crumbs.unshift({stateName: state.name, text: state.menuText});
            }
        } while ((state = state.parent));
        $rootScope.crumbs = crumbs;
        
        $rootScope.setTitleText();
        maUiDateBar.rollupTypesFilter = {};
        
        $rootScope.stateNameClass = toState.name.replace(/\./g, '_');

        // if help is already open or the helpOpen param is true the new page's help
        if ($rootScope.pageOpts.helpUrl || toParams.helpOpen) {
            $rootScope.openHelp();
        }
    });

    // wait for the dashboard view to be loaded then set it to open if the
    // screen is a large one. By default the internal state of the sidenav thinks
    // it is closed even if it is locked open
    $rootScope.$on('$viewContentLoaded', function(event, view) {
        if (view === '@ui') {
            if ($mdMedia('gt-sm')) {
                const uiPrefs = localStorageService.get('uiPreferences');
                if (!uiPrefs || !uiPrefs.menuClosed) {
                    $rootScope.openMenu();
                }
            }
            
            // the closeMenu() function already does this but we need this for when the ESC key is pressed
            // which just calls $mdSidenav(..).close();
            $mdSidenav('left').onClose(function () {
                $rootScope.navLockedOpen = false;
            });
        }
        
        const mainContent = document.querySelector('md-content.main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
            
            // if main content contains the hash element scroll to it
            const hash = $location.hash();
            if (hash && mainContent.querySelector('#' + hash)) {
                //$anchorScroll();
            }
        }
    });

    // automatically open or close the menu when the screen size is changed
    $rootScope.$watch($mdMedia.bind($mdMedia, 'gt-sm'), function(gtSm, prev) {
        if (gtSm === prev) return; // ignore first "change"
        if (!$state.includes('ui')) return; // nothing to do if menu not visible
        
        const sideNav = $mdSidenav('left');
        const uiPrefs = localStorageService.get('uiPreferences') || {};
        
        // window expanded
        if (gtSm && !uiPrefs.menuClosed && !sideNav.isOpen()) {
            $rootScope.openMenu();
        }
        // window made smaller
        if (!gtSm && sideNav.isOpen()) {
            $rootScope.closeMenu();
        }
    });
    
    $rootScope.toggleMenu = function() {
        const sideNav = $mdSidenav('left');
        const uiPrefs = localStorageService.get('uiPreferences') || {};
        
        if (sideNav.isOpen()) {
            uiPrefs.menuClosed = true;
            this.closeMenu();
        } else {
            uiPrefs.menuClosed = false;
            this.openMenu();
        }
        
        // we dont update the preferences when on a small screen as the nav is never locked open or closed
        if ($mdMedia('gt-sm')) {
            localStorageService.set('uiPreferences', uiPrefs);
        }
        angular.element('#menu-button').blur();
    };

    $rootScope.closeMenu = function() {
        $rootScope.navLockedOpen = false;
        if ($state.includes('ui')) {
            $mdSidenav('left').close();
        }
    };

    $rootScope.openMenu = function() {
        if ($mdMedia('gt-sm')) {
            $rootScope.navLockedOpen = true;
        }
        if ($state.includes('ui')) {
            $mdSidenav('left').open();
        }
    };

    /**
     * Watchdog timer alert and re-connect/re-login code
     */

    $rootScope.$on('maWatchdog', function(event, current, previous) {
        let message;
        let hideDelay = 0; // dont auto hide message

        if (current.status !== 'STARTING_UP' && current.status === previous.status)
            return;

        switch(current.status) {
        case 'API_DOWN':
            message = Translate.trSync('login.ui.app.apiDown');
            break;
        case 'STARTING_UP':
            if (current.status === previous.status && current.info.startupProgress === previous.info.startupProgress &&
                    current.info.startupState === previous.info.startupState) {
                return;
            }
            message = Translate.trSync('login.ui.app.startingUp', [current.info.startupProgress, current.info.startupState]);
            break;
        case 'API_ERROR':
            message = Translate.trSync('login.ui.app.returningErrors');
            break;
        case 'API_UP':
            if (previous.status && previous.status !== 'LOGGED_IN') {
                message = Translate.trSync('login.ui.app.connectivityRestored');
                hideDelay = 5000;
            }

            // do automatic re-login if we are not on the login page
            if (!$state.includes('login') && !current.wasLogout) {
                User.autoLogin().then(null, function() {
                    // close dialogs
                    $mdDialog.cancel();
                    
                    // redirect to the login page if auto-login fails
                    $state.loginRedirectUrl = '/ui' + $location.url();
                    $state.go('login');
                    //window.location = $state.href('login');
                });
            }
            break;
        case 'LOGGED_IN':
            // occurs almost simultaneously with API_UP message, only display if we didn't hit API_UP state
            if (previous.status && previous.status !== 'API_UP') {
                message = Translate.trSync('login.ui.app.connectivityRestored');
                hideDelay = 5000;
            }
            break;
        }

        if (message) {
            const toast = $mdToast.simple()
                .textContent(message)
                .action(Translate.trSync('login.ui.app.ok'))
                .highlightAction(true)
                .position('bottom center')
                .hideDelay(hideDelay);
            $mdToast.show(toast);
        }
    });
    
    // stops window to navigating to a file when dropped on root document
    $document.on('dragover drop', function($event) {
        return false;
    });
    
    $rootScope.appLoading = false;
}]);

/**
 * From here down is the bootstrap code, all actual angular app code is above
 */

// Get an injector for the ngMangoServices app and use the JsonStore service to retrieve the
// custom user menu items from the REST api prior to bootstrapping the main application.
// This is so the states can be added to the stateProvider in the config block for the
// main application. If the states are added after the main app runs then the user may
// not navigate directly to one of their custom states on startup
const servicesInjector = angular.injector(['ngMangoServices'], true);
const User = servicesInjector.get('maUser');
const JsonStore = servicesInjector.get('maJsonStore');
const $q = servicesInjector.get('$q');
const $http = servicesInjector.get('$http');
const maCssInjector = servicesInjector.get('maCssInjector');

// ensures credentials are saved/deleted on first page load if params are set
User.getCredentialsFromUrl();

const defaultUiSettingsPromise = $q.resolve(defaultUiSettings);
const customUiSettingsPromise = JsonStore.getPublic({xid: MA_UI_SETTINGS_XID}).$promise.then(null, angular.noop);

const uiSettingsPromise = $q.all([defaultUiSettingsPromise, customUiSettingsPromise]).then(function(results) {
    const defaultUiSettings = results[0];
    const customUiSettings = results[1];
    
    const MA_UI_SETTINGS = {};
    if (defaultUiSettings) {
        MA_UI_SETTINGS.defaultSettings = defaultUiSettings;
        angular.merge(MA_UI_SETTINGS, defaultUiSettings);
    }
    if (customUiSettings) {
        MA_UI_SETTINGS.initialSettings = customUiSettings.jsonData;
        angular.merge(MA_UI_SETTINGS, customUiSettings.jsonData);
    }

    if (MA_UI_SETTINGS.userCss) {
    	maCssInjector.injectLink(MA_UI_SETTINGS.userCss, 'userCss', 'meta[name="user-styles-after-here"]');
    }
    
    // contains fix for https://github.com/angular/material/issues/10516
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Mac OS X') >= 0 && userAgent.indexOf('Safari/') >= 0 &&
    		userAgent.indexOf('Chrome/') < 0 && userAgent.indexOf('Chromium/') < 0) {
        // assign to variable to stop other warnings
        // jshint unused:false
        const safariCss = import(/* webpackChunkName: "ui.safari" */ './styles/safari.css');
    }
    
    return MA_UI_SETTINGS;
});

const userAndMenuPromise = User.getCurrent().$promise.then(null, function() {
	return uiSettingsPromise.then(function(MA_UI_SETTINGS) {
		return User.autoLogin(MA_UI_SETTINGS);
	});
}).then(function(user) {
    const userMenuPromise = JsonStore.get({xid: MA_UI_MENU_XID}).$promise.then(null, angular.noop);
    return $q.all([user, userMenuPromise]);
}, angular.noop).then(function(data) {
    return {
        user: data && data[0],
        userMenuStore: data && data[1]
    };
});

const angularModulesPromise = uiSettingsPromise.then(function(MA_UI_SETTINGS) {
    return $http({
        method: 'GET',
        url: '/rest/v1/modules/angularjs-modules/public'
    }).then(function (response) {
        if (!response.data.urls || !Array.isArray(response.data.urls)) return;

        const urls = response.data.urls.map(function(url) {
            return url.replace(/^\/modules\/(.*?)\/web\/(.*?).js(?:\?v=(.*))?$/, function(match, module, filename, version) {
                moduleVersions[module] = version;
                return `modules/${module}/web/${filename}`;
            });
        });

        if (MA_UI_SETTINGS.userModule) {
            urls.push(MA_UI_SETTINGS.userModule);
        }

        const modulePromises = urls.map(function(url) {
            const deferred = $q.defer();
            requirejs([url], function(module) {
                deferred.resolve(module);
            }, function() {
                console.log('Failed to load AngularJS module', arguments);
                deferred.resolve();
            });
            return deferred.promise;
        });

        return $q.all(modulePromises);
    }, function() {
        console.log('Error loading AngularJS modules from Mango modules', arguments);
    });
});

$q.all([userAndMenuPromise, uiSettingsPromise, angularModulesPromise]).then(function(data) {
    // *dont* destroy the services injector
	// If you do, you end up with two $rootScopes once the app bootstraps, the first with id 1, the second with id 2
	// This caused the "send test email" button not to work on first load
    //servicesInjector.get('$rootScope').$destroy();

    const user = data[0].user || null;
    const userMenuStore = data[0].userMenuStore;
    const MA_UI_SETTINGS = data[1];
    const angularModules = data[2] || [];

    uiApp.constant('MA_UI_CUSTOM_MENU_ITEMS', userMenuStore ? userMenuStore.jsonData.menuItems : null);
    uiApp.constant('MA_UI_CUSTOM_MENU_STORE', userMenuStore ? userMenuStore : null);

    uiApp.constant('MA_UI_SETTINGS', MA_UI_SETTINGS);
    uiApp.constant('MA_GOOGLE_ANALYTICS_PROPERTY_ID', MA_UI_SETTINGS.googleAnalyticsPropertyId);
    uiApp.constant('MA_POINT_VALUES_CONFIG', {limit: MA_UI_SETTINGS.pointValuesLimit});

    MA_UI_SETTINGS.mangoModuleNames = [];
    const angularJsModuleNames = ['maUiApp'];
    angularModules.forEach(function(angularModule, index, array) {
        if (angularModule && angularModule.name) {
            angularJsModuleNames.push(angularModule.name);
            
            if (MA_UI_SETTINGS.userModule && index === (array.length - 1)) {
            	MA_UI_SETTINGS.userModuleName = angularModule.name;
            } else {
            	MA_UI_SETTINGS.mangoModuleNames.push(angularModule.name);
            }
        }
    });
    
    angular.module('maUiBootstrap', angularJsModuleNames)
    .config(['maUserProvider', 'maUiMenuProvider', function(UserProvider, maUiMenuProvider) {
        // store pre-bootstrap user into the User service
        UserProvider.setUser(user);
        maUiMenuProvider.registerCustomMenuItems();
    }]);

    angular.element(function() {
        try {
            angular.bootstrap(document.documentElement, ['maUiBootstrap'], {strictDi: true});
        } catch (e) {
            const errorDiv = document.querySelector('.pre-bootstrap-error');
            const msgDiv = errorDiv.querySelector('div');
            const pre = errorDiv.querySelector('pre');
            const code = errorDiv.querySelector('code');
            const link = errorDiv.querySelector('a');

            msgDiv.textContent = 'Error bootstrapping Mango app: ' + e.message;
            code.textContent = e.stack;
            errorDiv.style.display = 'block';
            
            link.onclick = function() {
                pre.style.display = pre.style.display === 'none' ? 'block' : 'none';
            };
            
            throw e;
        }
    });
});
