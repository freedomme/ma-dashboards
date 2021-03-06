/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

 /**
  * @ngdoc directive
  * @name ngMango.directive:maWatchListGet
  * @restrict E
  * @description Gets a watch list by its XID and outputs it into the AngularJS scope. Does not display anything.
  *
  * @param {expression} ng-model Assignable expression to output the watch list to.
  * @param {string=} watch-list-xid The XID of the watch list to output.
  * @param {expression=} parameters Assignable expression to output the watch list parameters to. If parameters are passed in the defaults for the
  *     selected watch list will be applied to it.
  * @param {boolean=} [auto-state-params=false] Automatically update $stateParams (url parameters) when watch list parameters change. Also sets watch
  *     list parameters from the $stateParams when the watch list is loaded.
  * @param {expression=} on-points-change Expression is evaluated when the points change. Available scope parameters are `$points`.
  *     e.g. `on-points-change="$ctrl.pointsChanged($points)"`)
  * @param {expression=} on-parameters-change Expression is evaluated when the parameter values change. Available scope parameters are `$parameters`.
  *     e.g. `on-parameters-change="$ctrl.paramsChanged($parameters)"`)
  */

import WatchListSelectController from './WatchListSelectController';

watchListGetFactory.$inject = [];
function watchListGetFactory() {
    return {
        restrict: 'E',
        scope: {},
        controller: WatchListGetController,
        controllerAs: '$ctrl',
        bindToController: {
            watchListXid: '@?',
            parameters: '=?',
            autoStateParams: '<?',
            onPointsChange: '&?',
            onParametersChange: '&?'
        },
        require: {
            'ngModelCtrl': 'ngModel'
        },
        designerInfo: {
            translation: 'ui.components.watchListGet',
            icon: 'remove_red_eye',
            category: 'watchLists'
        }
    };
}

WatchListGetController.$inject = WatchListSelectController.$inject;
function WatchListGetController() {
    WatchListSelectController.apply(this, arguments);
}

WatchListGetController.prototype = Object.create(WatchListSelectController.prototype);
WatchListGetController.prototype.constructor = WatchListGetController;

WatchListGetController.prototype.$onInit = function() {
    this.ngModelCtrl.$render = this.render.bind(this);
};

WatchListGetController.prototype.render = function() {
    WatchListSelectController.prototype.render.apply(this, arguments);

    const prevUnsubscribe = this.unsubscribe;
    this.subscribe();
    if (prevUnsubscribe) {
        prevUnsubscribe();
    }
};

WatchListGetController.prototype.subscribe = function() {
    if (this.watchList) {
        this.unsubscribe = this.WatchList.notificationManager.subscribe({
            scope: this.$scope,
            handler: this.updateHandler.bind(this),
            xids: [this.watchList.xid]
        });
    }
};

WatchListGetController.prototype.updateHandler = function updateHandler(event, update) {
    if (event.name === 'update' && this.watchList && item.xid === this.watchList.xid) {
        this.setViewValue(item);
    }
};

export default watchListGetFactory;