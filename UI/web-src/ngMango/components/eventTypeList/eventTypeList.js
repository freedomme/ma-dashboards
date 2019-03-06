/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import eventTypeListTemplate from './eventTypeList.html';
import './eventTypeList.css';

// TODO show number of more specific items underneath that are checked
// TODO expand tree when rendering

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventTypeList
 * @restrict E
 * @description Displays a list of event types
 */

class EventTypeListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEventTypeInfo', 'maEvents', '$filter', 'maPoint']; }
    
    constructor(EventTypeInfo, maEvents, $filter, Point) {
        this.EventTypeInfo = EventTypeInfo;
        this.orderBy = $filter('orderBy');
        this.Point = Point;
        
        this.alarmLevels = maEvents.levels.reduce((map, level) => (map[level.key] = level, map), {});
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        
        this.typesPromise = this.EventTypeInfo.list().then(eventTypes => {
            return eventTypes.filter(et => et.subType == null);
        });
    }
    
    $onChanges(changes) {
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(Array.from(this.selected.values()));
    }
    
    render() {
        this.selected = new this.EventTypeInfo.EventTypeMap();

        const selectedTypes = this.ngModelCtrl.$viewValue;
        if (!Array.isArray(selectedTypes)) return;
        
        selectedTypes.forEach(eventType => {
            this.selected.set(eventType, eventType);
        });
    }

    selectedGetterSetter(eventType) {
        return value => {
            if (value === undefined) {
                return this.selected.has(eventType);
            }
            
            if (value) {                
                // TODO uncheck any more specific event types
                this.selected.set(eventType, eventType);
            } else {
                this.selected.delete(eventType, eventType);
            }
            
            this.setViewValue();
        };
    }
}

export default {
    template: eventTypeListTemplate,
    controller: EventTypeListController,
    bindings: {
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.eventTypeList',
        icon: 'priority_high'
    }
};
