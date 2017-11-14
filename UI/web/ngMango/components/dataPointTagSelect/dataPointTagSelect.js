/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDataPointTagSelect
 *
 * @description Displays a drop down list of tag values for a given key. You can set restrictions for other tag keys.
 *
 * @param {String} key The tag key
 * @param {Object} restrictions Restrictions for other tag keys. The object is a map of tag keys to tag values
 * @param {Boolean} select-multiple Set to true in order to enable selecting multiple tag values
 * 
 * @usage
 * <ma-data-point-tag-select key="name" restrictions="{device: 'Device 1'}" select-multiple="true"></ma-data-point-tag-select>
 *
 **/

class DataPointTagSelectController {
    static get $inject() { return ['maDataPointTags']; }
    
    constructor(maDataPointTags) {
        this.maDataPointTags = maDataPointTags;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => {
            this.selected = this.ngModelCtrl.$viewValue;
        };
    }
    
    $onChanges(changes) {
        const restrictions = Object.assign({}, this.restrictions);
        delete restrictions[this.key];
        
        this.maDataPointTags.values(this.key, restrictions).then(values => {
            this.values = values.sort();
        });
    }
    
    inputChanged() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
}

return {
    bindings: {
        key: '@',
        restrictions: '<?',
        selectMultiple: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    templateUrl: require.toUrl('./dataPointTagSelect.html'),
    controller: DataPointTagSelectController
};

}); // define