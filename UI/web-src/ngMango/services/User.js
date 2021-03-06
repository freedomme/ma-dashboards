/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import moment from 'moment-timezone';
import Cldr from 'cldrjs';
import angularLocaleCache from 'angularLocaleCache';

// preload popular locales
import 'angular-i18n/angular-locale_en';
import 'angular-i18n/angular-locale_en-001';
import 'angular-i18n/angular-locale_en-150';
import 'angular-i18n/angular-locale_en-us';
import 'angular-i18n/angular-locale_en-gb';
import 'angular-i18n/angular-locale_en-ca';
import 'angular-i18n/angular-locale_en-au';
import 'angular-i18n/angular-locale_en-za';
import 'angular-i18n/angular-locale_en-nz';
import 'angular-i18n/angular-locale_en-ie';
import 'angular-i18n/angular-locale_zh-cn';
import 'angular-i18n/angular-locale_ru-ru';
import 'angular-i18n/angular-locale_fr-fr';
import 'angular-i18n/angular-locale_es-es';
import 'angular-i18n/angular-locale_es-mx';
import 'angular-i18n/angular-locale_de-de';
import 'angular-i18n/angular-locale_pt-br';
import 'angular-i18n/angular-locale_it-it';
import 'angular-i18n/angular-locale_ja-jp';

/**
* @ngdoc service
* @name ngMangoServices.maUser
*
* @description
* Provides a service for getting list of users from the Mango system, as well as logging users in and out.
* - All methods return <a href="https://docs.angularjs.org/api/ngResource/service/$resource" target="_blank">$resource</a>
*   objects that can call the following methods available to those objects:
*   - `$save`
*   - `$remove`
*   - `$delete`
*   - `$get`
*
* # Usage
*
* <pre prettyprint-mode="javascript">
*  const user = User.login({
    username: $scope.username,
    password: $scope.password
});

User.logout();
* </pre>
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#get
*
* @description
* A default action provided by $resource. Makes a http GET call to the rest endpoint `/rest/v2/users/:username`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#save
*
* @description
* A default action provided by $resource. Makes a http POST call to the rest endpoint `/rest/v2/users/:username`
* @param {object} query Object containing a `username` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#remove
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v2/users/:username`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#delete
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v2/users/:username`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#rql
*
* @description
* Passed a string containing RQL for the query and returns an array of user objects.
* @param {string} RQL RQL string for the query
* @returns {array} An array of user objects. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#getById
*
* @description
* Query the REST endpoint `/rest/v2/users/by-id/:id` with the `GET` method.
* @param {object} query Object containing a `id` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#getCurrent
*
* @description
* Query the REST endpoint `/rest/v2/users/current` with the `GET` method to return the currently logged in user.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#login
*
* @description
* Attempts to login in the user by using `GET` method at `/rest/v2/login/:username`
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#logout
*
* @description
* Logout the current user by using `GET` method at `/rest/v2/login/:username`
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

UserProvider.$inject = ['MA_DEFAULT_TIMEZONE', 'MA_DEFAULT_LOCALE'];
function UserProvider(MA_DEFAULT_TIMEZONE, MA_DEFAULT_LOCALE) {
    let bootstrapUser = null;
    let systemLocale;
    let systemTimezone;

    this.setUser = function(user) {
        bootstrapUser = user;
    };
    this.setSystemLocale = function(locale) {
        systemLocale = locale;
    };
    this.setSystemTimezone = function(timezone) {
        systemTimezone = timezone;
    };
    
    moment.tz.setDefault(MA_DEFAULT_TIMEZONE || moment.tz.guess());
    moment.locale(MA_DEFAULT_LOCALE || window.navigator.languages || window.navigator.language);

    this.$get = UserFactory;
    
    /*
     * Provides service for getting list of users and create, update, delete
     */
    UserFactory.$inject = ['$resource', '$cacheFactory', 'localStorageService', '$q', 'maUtil', '$http', 'maServer', '$injector', '$cookies'];
    function UserFactory($resource, $cacheFactory, localStorageService, $q, Util, $http, maServer, $injector, $cookies) {
        
        let cachedUser, angularLocaleDeferred;
        const authTokenBaseUrl = '/rest/v2/auth-tokens';
        const passwordResetUrl = '/rest/v2/password-reset';
        const emailVerificationUrl = '/rest/v2/email-verification';
        const defaultProperties = {
            username: '',
            name: '',
            email: '',
            phone: '',
            homeUrl: '',
            locale: '',
            timezone: '',
            permissions: [],
            muted: true,
            receiveOwnAuditEvents: false,
            disabled: false,
            receiveAlarmEmails: 'IGNORE'
        };

        const User = $resource('/rest/v2/users/:username', {
                username: data => data && (data.originalId || data.username)
            }, {
            query: {
                method: 'GET',
                isArray: true,
                transformResponse: Util.transformArrayResponse,
                interceptor: {
                    response: Util.arrayResponseInterceptor
                }
            },
            getById: {
                url: '/rest/v2/users/by-id/:id',
                method: 'GET',
                isArray: false
            },
            getCurrent: {
                url: '/rest/v2/users/current',
                method: 'GET',
                isArray: false,
                interceptor: {
                    response: loginInterceptor
                }
            },
            login: {
                url: '/rest/v2/login',
                method: 'POST',
                isArray: false,
                interceptor: {
                    response: loginInterceptor
                }
            },
            switchUser: {
                url: '/rest/v2/login/su',
                method: 'POST',
                isArray: false,
                interceptor: {
                    response: loginInterceptor
                },
                hasBody: false
            },
            exitSwitchUser: {
                url: '/rest/v2/login/exit-su',
                method: 'POST',
                isArray: false,
                interceptor: {
                    response: loginInterceptor
                },
                hasBody: false
            },
            logout: {
                url: '/rest/v2/logout',
                method: 'POST',
                isArray: false,
                interceptor: {
                    response: logoutInterceptor
                },
                hasBody: false
            },
            save: {
                method: 'POST',
                url: '/rest/v2/users/',
                params: {
                    username: null
                }
            },
            update: {
                method: 'PUT'
            }
        }, {
            idProperty: 'username',
            defaultProperties,
            autoXid: false
        });

        Object.assign(User.notificationManager, {
            webSocketUrl: '/rest/v2/websocket/users'
        });

        Object.assign(User, {
            setUser(user) {
                if (!angular.equals(user, cachedUser)) {
                    const firstChange = cachedUser === undefined;
                    
                    if (user) {
                        cachedUser = user instanceof User ? user : Object.assign(Object.create(User.prototype), user);
                    } else {
                        cachedUser = null;
                    }
                    
                    this.configureLocale();
                    this.configureTimezone();
                    
                    this.notificationManager.notify('userChanged', cachedUser, firstChange);
                }
            },
    
            configureLocale(locale = this.getLocale()) {
                if (locale !== this.locale) {
                    const firstChange = this.locale == null;
                    this.locale = locale;
    
                    // moment doesn't support locales with a script, just supply it with language and region
                    const cldrAttributes = new Cldr(locale).attributes;
                    moment.locale(`${cldrAttributes.language}-${cldrAttributes.region}`);
    
                    const localeId = locale.toLowerCase();
                    const $locale = $injector.get('$locale');
                    if (localeId !== $locale.id) {
                        // cancel any pending request for a locale
                        if (angularLocaleDeferred) {
                            angularLocaleDeferred.reject('cancel');
                        }
                        
                        angularLocaleDeferred = $q.defer();
                        
                        // localeCache.getLocale() returns ES6 promise, convert to AngularJS $q promise
                        angularLocaleCache.getLocale(localeId).then(angularLocaleDeferred.resolve, angularLocaleDeferred.reject);
                        
                        angularLocaleDeferred.promise.then(newLocaleData => {
                            // deep replace all properties of existing locale with the keys from the new locale
                            // this is necessary as the filters cache $locale.NUMBER_FORMATS for example
                            Util.deepReplace($locale, newLocaleData);
                        }, error => {
                            if (error !== 'cancel') {
                                return $q.reject(error);
                            }
                        });
                    }
    
                    this.notificationManager.notify('localeChanged', locale, firstChange);
                }
            },
    
            configureTimezone(timezone = this.getTimezone()) {
                if (timezone !== this.timezone) {
                    const firstChange = this.timezone == null;
                    this.timezone = timezone;
                    
                    moment.tz.setDefault(timezone);
                    
                    this.notificationManager.notify('timezoneChanged', timezone, firstChange);
                }
            },
            
            getLocale() {
                if (cachedUser) {
                    return cachedUser.getLocale();
                }
                return this.getSystemLocale();
            },
            
            getSystemLocale() {
                return systemLocale || MA_DEFAULT_LOCALE || (window.navigator.languages && window.navigator.languages[0]) || window.navigator.language;
            },
    
            getTimezone() {
                if (cachedUser) {
                    return cachedUser.getTimezone();
                }
                return this.getSystemTimezone();
            },
            
            getSystemTimezone() {
                return systemTimezone || MA_DEFAULT_TIMEZONE || moment.tz.guess();
            },

            loginInterceptors: [],
            logoutInterceptors: [],
    
            storeCredentials(username, password) {
                localStorageService.set('storedCredentials', {
                    username: username,
                    password: password
                });
            },
            
            storedUsername() {
                const credentials = localStorageService.get('storedCredentials');
                return credentials ? credentials.username : null;
            },
            
            getCredentialsFromUrl() {
                const params = new URL(window.location.href).searchParams;
                if (!params) return;
                
                const credentials = {
                    username: params.get('autoLoginUsername'),
                    password: params.get('autoLoginPassword') || ''
                };
                
                if (params.get('autoLoginDeleteCredentials') != null) {
                    User.clearStoredCredentials();
                } else if (params.get('autoLoginStoreCredentials') != null && credentials.username) {
                    User.storeCredentials(credentials.username, credentials.password);
                }
                
                return credentials.username && credentials;
            },
            
            autoLogin(maUiSettings) {
                let credentials = User.getCredentialsFromUrl() || localStorageService.get('storedCredentials');
                if (!credentials && (maUiSettings || $injector.has('maUiSettings'))) {
                    maUiSettings = maUiSettings || $injector.get('maUiSettings');
                    if (maUiSettings.autoLoginUsername) {
                        credentials = {
                            username: maUiSettings.autoLoginUsername,
                            password: maUiSettings.autoLoginPassword || ''
                        };
                    }
                }
                if (!credentials) {
                    return $q.reject('No stored credentials');
                }
                return this.login.call(this, credentials).$promise;
            },
            
            clearStoredCredentials() {
                localStorageService.remove('storedCredentials');
            },
            
            sendPasswordResetEmail(username, email) {
                return $http({
                    url: `${passwordResetUrl}/send-email`,
                    method: 'POST',
                    data: {
                        username,
                        email
                    }
                });
            },
            
            createPasswordResetLink(username, lockPassword, sendEmail, expiry) {
                return $http({
                    url: `${passwordResetUrl}/create`,
                    method: 'POST',
                    data: {
                        username,
                        lockPassword,
                        sendEmail,
                        expiry
                    }
                }).then(response => response.data);
            },
            
            passwordReset(token, newPassword) {
                return $http({
                    url: `${passwordResetUrl}/reset`,
                    method: 'POST',
                    data: {
                        token,
                        newPassword
                    }
                });
            },
    
            createAuthToken(expiry, username) {
                return $http({
                    url: `${authTokenBaseUrl}/create`,
                    method: 'POST',
                    data: {
                        username,
                        expiry
                    }
                }).then(response => {
                    return response.data.token;
                });
            },
    
            revokeAuthTokens(username) {
                let url = `${authTokenBaseUrl}/revoke`;
                if (username != null && username !== (this.current && this.current.username)) {
                    url += `/${encodeURIComponent(username)}`;
                }
    
                return $http({
                    url,
                    method: 'POST'
                }).then(response => {
                    return response.data;
                });
            },
    
            revokeAllAuthTokens() {
                let url = `${authTokenBaseUrl}/reset-keys`;
                return $http({
                    url,
                    method: 'POST'
                }).then(response => {
                    return response.data;
                });
            },
            
            publicVerifyEmail(email) {
                return $http({
                    url: `${emailVerificationUrl}/public/send-email`,
                    method: 'POST',
                    data: {
                        emailAddress: email
                    }
                });
            },
            
            publicUpdateEmail(token) {
                return $http({
                    url: `${emailVerificationUrl}/public/update-email`,
                    method: 'POST',
                    data: {
                        token
                    }
                }).then(response => {
                    return Object.assign(Object.create(this.prototype), response.data);
                });
            },
            
            sendEmailVerification(data) {
                return $http({
                    url: `${emailVerificationUrl}/send-email`,
                    method: 'POST',
                    data
                });
            },
            
            createEmailVerificationToken(data) {
                return $http({
                    url: `${emailVerificationUrl}/create-token`,
                    method: 'POST',
                    data
                }).then(response => response.data);
            },
            
            publicRegisterUser(token, user) {
                return $http({
                    url: `${emailVerificationUrl}/public/register`,
                    method: 'POST',
                    data: {
                        token, user
                    }
                }).then(response => {
                    return Object.assign(Object.create(this.prototype), response.data);
                });
            },
            
            ensureXsrfToken() {
                // ensures there is a CSRF protection cookie set before logging in
                const xsrfCookie = $cookies.get($http.defaults.xsrfCookieName);
                if (!xsrfCookie) {
                    $cookies.put($http.defaults.xsrfCookieName, Util.uuid(), {path: '/'});
                }
            }
        });
        
        const login = User.login;
        User.login = function() {
            this.ensureXsrfToken();
            return login.apply(this, arguments);
        };

        Object.defineProperty(User, 'current', {
            get: function() {
                return cachedUser;
            },
            set: User.setUser
        });

        Object.assign(User.prototype, {
            /**
             * returns true if user has any of the desired roles (can be an array or comma separated string)
             */
            hasAnyRole(roles, emptyIsAdminOnly) {
                if (emptyIsAdminOnly && (!roles || !roles.length)) {
                    roles = ['superadmin'];
                }
                
                if (!roles || !roles.length) return true;

                if (typeof roles === 'string') {
                    roles = roles.split(/\s*\,\s*/);
                }

                return roles.some(r => this.hasRole(r));
            },
            
            hasRole(role) {
                // this.permissions is actually an array of the user's roles
                return this.permissions.some(r => r === 'superadmin' || r === role);
            },

            /**
             * returns true if user has any of the permissions (can be an array or a single permission string)
             */
            hasAnyPermission(permission) {
                if (!permission) return true;
                
                if (Array.isArray(permission)) {
                    if (!permission.length) return true;
                    return permission.some(p => this.grantedPermissions.includes(p));
                }
                return this.grantedPermissions.includes(permission);
            },

            getTimezone() {
                return this.timezone || this.constructor.getSystemTimezone();
            },

            sendTestEmail(toEmail, usernameInEmail) {
                return maServer.sendTestEmail(toEmail || this.email, usernameInEmail || this.username);
            },
            
            getLocale() {
                return this.locale || this.constructor.getSystemLocale();
            },

            createAuthToken(expiry) {
                return this.constructor.createAuthToken(expiry);
            },
            
            revokeAuthTokens() {
                return this.constructor.revokeAuthTokens();
            },
            
            createdDuration(now = new Date()) {
                const nowM = moment(now);
                const created = moment(this.created);
                return moment.duration(created.diff(nowM));
            },
            
            emailVerifiedDuration(now = new Date()) {
                const nowM = moment(now);
                const emailVerified = moment(this.emailVerified);
                return moment.duration(emailVerified.diff(nowM));
            },
            
            lastLoginDuration(now = new Date()) {
                const nowM = moment(now);
                const lastLogin = moment(this.lastLogin);
                return moment.duration(lastLogin.diff(nowM));
            },
            
            lastPasswordChangeDuration(now = new Date()) {
                const nowM = moment(now);
                const lastPasswordChange = moment(this.lastPasswordChange);
                return moment.duration(lastPasswordChange.diff(nowM));
            },
            
            sendEmailVerification(emailAddress = this.email) {
                return this.constructor.sendEmailVerification({
                    username: this.username,
                    emailAddress
                });
            },
            
            createEmailVerificationToken(emailAddress = this.email) {
                return this.constructor.createEmailVerificationToken({
                    username: this.username,
                    emailAddress
                });
            }
        });

        // This would be more accurately named "fetched current user" interceptor
        // User.current is set in maWatchdog.setStatus() via one of these interceptors which is registered in ngMango.js
        function loginInterceptor(data) {
            
            // set some properties on the user from headers that will only be available when logging in
            const loginRedirectUrl = data.headers('X-Mango-Default-URI');
            const lastUpgrade = data.headers('X-Mango-Last-Upgrade');
            
            if (loginRedirectUrl) {
                data.resource.loginRedirectUrl = loginRedirectUrl;
                const required = data.headers('X-Mango-Default-URI-Required');
                data.resource.loginRedirectUrlRequired = !!(required && required.toLowerCase() !== 'false');
            }
            
            if (lastUpgrade) {
                data.resource.lastUpgradeTime = parseInt(lastUpgrade, 10);
            }
            
            User.loginInterceptors.forEach(interceptor => interceptor(data));
            
            if (data.resource.username) {
                data.resource.originalId = data.resource.username;
            }

            return data.resource;
        }
        
        function logoutInterceptor(data) {
            User.logoutInterceptors.forEach(interceptor => interceptor(data));

            if (data.resource.username) {
                data.resource.originalId = data.resource.username;
            }
            
            return data.resource;
        }
        
        class NoUserError extends Error {}
        User.NoUserError = NoUserError;

        // set the initial user and configure initial locale and timezone
        User.setUser(bootstrapUser);
        bootstrapUser = undefined;

        return User;
    }
}

export default UserProvider;
