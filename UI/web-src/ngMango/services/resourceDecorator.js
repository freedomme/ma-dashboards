/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';

resourceDecorator.$inject = ['$delegate', 'maRqlBuilder', 'maUtil', 'maNotificationManager', '$q'];
function resourceDecorator($delegate, RqlBuilder, maUtil, NotificationManager, $q) {

    return function resourceWithBuildQuery(url, paramDefaults, actions, options = {}) {
        const defaultProperties = options.defaultProperties || {};
        const idProperty = options.idProperty || 'xid';
        const xidPrefix = options.xidPrefix || '';
        const autoXid = options.autoXid == null || options.autoXid;
        
        if (!options.hasOwnProperty('cancellable')) {
            options.cancellable = true;
        }
        
        if (!actions.update) {
            actions.update = {
                method: 'PUT'
            };
        }
        if (!actions.get) {
            actions.get = {
                method: 'GET'
            };
        }
        
        // dont apply originalId to deleted item
        Object.keys(actions).filter(key => key !== 'delete').forEach(key => {
            const action = actions[key];
            if (!action.interceptor) {
                action.interceptor = {};
            }
            if (!action.interceptor.response) {
                // interceptor to copy the xid to the originalId property
                action.interceptor.response = function(response) {
                    const resource = response.resource;
                    const originalId = resource[idProperty];
                    if (originalId) {
                        resource.originalId = originalId;
                    }
                    return resource;
                };
            }
        });
        
        const Resource = $delegate.call(this, url, paramDefaults, actions, options);

        function ExtendedResource(value) {
            Resource.call(this, Object.assign({}, angular.copy(defaultProperties), value));

            if (autoXid && !this[idProperty]) {
                this[idProperty] = xidPrefix + maUtil.uuid();
            }
        }

        Object.assign(ExtendedResource, Resource, {
            idProperty,
            objQuery: maUtil.objQuery,
            
            // maps request promises to resources
            requests: new WeakMap(),

            buildQuery() {
                const builder = new RqlBuilder();
                builder.queryFunction = (queryObj, opts) => {
                    const resource = this.query({rqlQuery: queryObj.toString()});
                    this.requests.set(resource.$promise, resource);
                    return resource.$promise;
                };
                return builder;
            },
            
            cancelRequest(promise, reason) {
                const resource = this.requests.get(promise);
                if (resource && typeof resource.$cancelRequest === 'function' && !resource.$resolved) {
                    resource.cancelled = true;
                    resource.$cancelRequest(reason);
                }
            },

            notificationManager: new NotificationManager({
                transformObject: (item) => {
                    const resource = Object.assign(Object.create(ExtendedResource.prototype), item);
                    const originalId = resource[idProperty];
                    if (originalId) {
                        resource.originalId = originalId;
                    }
                    return resource;
                }
            })
        });

        ExtendedResource.prototype = Object.assign(Resource.prototype, {
            constructor: ExtendedResource,
            
            isNew() {
                return !this.originalId;
            },

            get(...args) {
                return this.$get(...args);
            },
            
            save(...args) {
                if (this.isNew()) {
                    return this.$save(...args);
                } else {
                    return this.$update(...args);
                }
            },
            
            delete(...args) {
                return this.$delete(...args);
            },
            
            getAndSubscribe($scope) {
                return this.$get().catch(error => {
                    if (error.status === 404) {
                        return this;
                    }
                    return $q.reject(error);
                }).then(item => {
                    this.constructor.notificationManager.subscribeToXids([item.xid], (event, updatedItem) => {
                        Object.assign(item, updatedItem);
                    }, $scope);
                    
                    return item;
                });
            },
            
            copy(createWithNewId = false) {
                const copy = angular.copy(this);
                if (createWithNewId) {
                    delete copy.id;
                    delete copy.originalId;
                    copy[idProperty] = xidPrefix + maUtil.uuid();
                }
                return copy;
            }
        });

        return ExtendedResource;
    };
}

export default resourceDecorator;