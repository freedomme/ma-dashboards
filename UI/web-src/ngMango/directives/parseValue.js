/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import moment from 'moment-timezone';

parseValue.$inject = ['$parse'];
function parseValue($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        priority: 1,
        link: function($scope, $element, $attrs, ngModel) {
            if (!$attrs.maParseValue) return;
            
            const expression = $parse($attrs.maParseValue);

            ngModel.$parsers.push(value => {
                return expression($scope, {$value: value, $Math: Math, $Number: Number, $moment: moment});
            });
        }
    };
}

export default parseValue;