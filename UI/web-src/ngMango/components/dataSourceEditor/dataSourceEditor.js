/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import dataSourceEditorTemplate from './dataSourceEditor.html';
import './dataSourceEditor.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDataSourceEditor
 * @restrict E
 * @description Editor for a data source, allows creating, updating or deleting
 */

const $inject = Object.freeze(['maDataSource', '$q', 'maDialogHelper', '$scope', '$window', 'maTranslate', '$element', 'maUtil', '$attrs', '$parse',
    'maPoint', 'MA_TIME_PERIOD_TYPES']);

class DataSourceEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return $inject; }
    
    constructor(maDataSource, $q, maDialogHelper, $scope, $window, maTranslate, $element, maUtil, $attrs, $parse,
            Point, MA_TIME_PERIOD_TYPES) {
        this.maDataSource = maDataSource;
        this.$q = $q;
        this.maDialogHelper = maDialogHelper;
        this.$scope = $scope;
        this.$window = $window;
        this.maTranslate = maTranslate;
        this.$element = $element;
        this.maUtil = maUtil;
        this.Point = Point;
        
        this.pollTimePeriods = MA_TIME_PERIOD_TYPES.slice(0, 4);
        this.purgeTimePeriods = MA_TIME_PERIOD_TYPES.slice(4, 8);
        
        this.types = maDataSource.types;

        this.dynamicHeight = true;
        if ($attrs.hasOwnProperty('dynamicHeight')) {
            this.dynamicHeight = $parse($attrs.dynamicHeight)($scope.$parent);
        }
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render(true);
        
        this.$scope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
            if (event.defaultPrevented) return;
            
            if (!this.confirmDiscard('stateChange')) {
                event.preventDefault();
                return;
            }
        });

        const oldUnload = this.$window.onbeforeunload;
        this.$window.onbeforeunload = (event) => {
            if (this.form && this.form.$dirty && this.checkDiscardOption('windowUnload')) {
                const text = this.maTranslate.trSync('ui.app.discardUnsavedChanges');
                event.returnValue = text;
                return text;
            }
        };
        
        this.$scope.$on('$destroy', () => {
            this.$window.onbeforeunload = oldUnload;
        });

        this.Point.notificationManager.subscribe((event, point) => {
            if (this.dataSource && point.dataSourceXid === this.dataSource.xid && this.activeTab === 1 && Array.isArray(this.points)) {
                debugger;
                const target = this.points.find(p => p.xid === point.xid);
                if (event.name === 'update' && target) {
                    angular.copy(point, target);
                }
            }
        }, this.$scope);
    }
    
    $onChanges(changes) {
    }
    
    render(confirmDiscard = false) {
        if (confirmDiscard && !this.confirmDiscard('modelChange')) {
            this.setViewValue();
            return;
        }
        
        this.validationMessages = [];
        this.activeTab = 0;
        
        const viewValue = this.ngModelCtrl.$viewValue;
        if (viewValue) {
            if (viewValue instanceof this.maDataSource) {
                this.dataSource = viewValue.copy();
            } else {
                this.dataSource = Object.assign(Object.create(this.maDataSource.prototype), viewValue);
            }
        } else {
            this.dataSource = null;
        }

        if (this.form) {
            this.form.$setPristine();
            this.form.$setUntouched();
        }
        
        this.points = [];
        this.cancelPointsQuery();
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.dataSource);
    }

    saveItem(event) {
        this.form.$setSubmitted();
        
        if (!this.form.$valid) {
            this.maDialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }
        
        this.validationMessages = [];
        
        this.dataSource.save().then(item => {
            this.setViewValue();
            this.render();
            this.maDialogHelper.toast(['ui.components.dataSourceSaved', this.dataSource.name || this.dataSource.xid]);
        }, error => {
            let statusText = error.mangoStatusText;
            
            if (error.status === 422) {
                statusText = error.mangoStatusTextShort;
                this.validationMessages = error.data.validationMessages;
                
                const withProperty = this.validationMessages.filter(m => m.property);
                if (withProperty.length) {
                    const property = withProperty[0].property;
                    const inputElement = this.maUtil.findInputElement(property, this.form);
                    this.activateTab(inputElement);
                }
            }
            
            this.maDialogHelper.errorToast(['ui.components.dataSourceSaveError', statusText]);
        });
    }
    
    revertItem(event) {
        if (this.confirmDiscard('revert')) {
            this.render();
        }
    }

    deleteItem(event) {
        const notifyName = this.dataSource.name || this.dataSource.originalId;
        this.maDialogHelper.confirm(event, ['ui.components.dataSourceConfirmDelete', notifyName]).then(() => {
            this.dataSource.delete().then(() => {
                this.maDialogHelper.toast(['ui.components.dataSourceDeleted', notifyName]);
                this.dataSource = null;
                this.setViewValue();
                this.render();
            }, error => {
                this.maDialogHelper.toast(['ui.components.dataSourceDeleteError', error.mangoStatusText]);
            });
        }, angular.noop);
    }
    
    checkDiscardOption(type) {
        return this.discardOptions === true || (this.discardOptions && this.discardOptions[type]);
    }
    
    confirmDiscard(type) {
        if (this.form && this.form.$dirty && this.checkDiscardOption(type)) {
            return this.$window.confirm(this.maTranslate.trSync('ui.app.discardUnsavedChanges'));
        }
        return true;
    }
    
    activateTab(query) {
        if (!query) return;
        
        const tabElements = this.$element[0].querySelectorAll('md-tab-content');

        const index = Array.prototype.findIndex.call(tabElements, tab => {
            if (query instanceof Node) {
                return tab.contains(query);
            }
            
            return !!tab.querySelector(query);
        });
        
        if (index >= 0) {
            this.activeTab = index;
        }
    }
    
    cancelPointsQuery() {
        if (this.pointsPromiseQuery) {
            this.Point.cancelRequest(this.pointsPromiseQuery);
        }
    }
    
    queryPoints() {
        this.cancelPointsQuery();

        if (!this.dataSource || this.dataSource.isNew()) {
            return;
        }

        this.pointsPromiseQuery = this.Point.buildQuery()
            .eq('dataSourceXid', this.dataSource.xid)
            .limit(100000) // TODO
            .query();

        this.pointsPromise = this.pointsPromiseQuery.then(points => {
            return (this.points = points);
        }).catch(error => {
            if (error.status === -1 && error.resource && error.resource.cancelled) {
                // request cancelled, ignore error
                return;
            }
            
            const message = error.mangoStatusText || (error + '');
            this.maDialogHelper.errorToast(['ui.app.errorGettingPoints', message]);
        });
        
        return this.pointsPromise;
    }
    
    typeChanged() {
        const prevSource = this.dataSource;
        this.dataSource = this.typesByName[prevSource.modelType].createDataPoint();
        
        // copy only a select set of properties over
        this.dataSource.enabled = prevSource.enabled;
        this.dataSource.name = prevSource.name;
        this.dataSource.editPermission = prevSource.editPermission;
        this.purgeSettings = prevSource.purgeSettings;
    }

}

export default {
    template: dataSourceEditorTemplate,
    controller: DataSourceEditorController,
    bindings: {
        discardOptions: '<?confirmDiscard'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.dataSourceEditor',
        icon: 'link'
    }
};
