/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

configureInputContainerDirective.$inject = ['maUtil'];
function configureInputContainerDirective(maUtil) {

    class ConfigureInputContainerController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$scope', '$element', '$attrs']; }
        
        constructor($scope, $element, $attrs) {
            this.$scope = $scope;
            this.$element = $element;
            this.$attrs = $attrs;
        }
        
        $onInit() {
            this.configureInputContainer();
        }
        
        configureInputContainer() {
            const ngModelCtrl = this.ngModelCtrl;
            if (this.dropDownCtrl) {
                // if this input is not already in a form, add it to the form the drop down is inside
                if (!this.formCtrl) {
                    const form = this.dropDownCtrl.formCtrl;
                    if (form) {
                        form.$addControl(ngModelCtrl);
                    }
                }
                
                // set the model to touched when we close the dropdown
                this.$scope.$on('maDropDownClose', () => {
                    if (!ngModelCtrl.$touched) {
                        ngModelCtrl.$setTouched();
                    }
                });
            }

            // find our immediate container, or the container which the drop down is inside of
            const containerCtrl = this.containerCtrl || this.dropDownCtrl && this.dropDownCtrl.containerCtrl;
            if (containerCtrl) {
                const parentForm = ngModelCtrl.$$parentForm;
                
                // watch the model for errors and set the container to invalid
                const isErrorGetter = () => ngModelCtrl.$invalid && (ngModelCtrl.$touched || (parentForm && parentForm.$submitted));
                this.$scope.$watch(isErrorGetter, containerCtrl.setInvalid);

                // handle adding the asterisk to the label when input is required
                if (containerCtrl.label) {
                    this.required = false;
                    this.$attrs.$observe('required', value => {
                        const required = typeof value === 'string' || !!value;
                        if (this.required !== required) {
                            this.required = required;
                            const mdNoAsterisk = this.$attrs.mdNoAsterisk === '' || this.$scope.$eval(this.$attrs.mdNoAsterisk);
                            containerCtrl.label.toggleClass('md-required', required && !mdNoAsterisk);
                        }
                    });
                }

                // tell the container when we have a value (i.e. not empty) so the label can float up
                const setHasValue = value => {
                    let hasValue;
                    // allow user to define their own has-value attribute
                    if (this.$attrs.hasOwnProperty('hasValue')) {
                        hasValue = this.$scope.$eval(this.$attrs.hasValue, {$value: value});
                    } else {
                        hasValue = this.$element[0].hasAttribute('multiple') ? Array.isArray(value) && value.length : value !== undefined;
                    }
                    containerCtrl.setHasValue(!!hasValue);
                    return value;
                };
                ngModelCtrl.$parsers.push(setHasValue);
                ngModelCtrl.$formatters.push(setHasValue);

                if (!this.dropDownCtrl) {
                    // tell the container when we are focused
                    this.$element[0].addEventListener('focus', () => containerCtrl.setFocused(true), true);
                    this.$element[0].addEventListener('blur', () => {
                        containerCtrl.setFocused(false);
                        // let the model know the input was touched
                        if (!ngModelCtrl.$touched) {
                            ngModelCtrl.$setTouched();
                        }
                    }, true);
                }

                const $container = containerCtrl.element;
                const $input = $container.children().maMatch('[ng-model], ma-drop-down-button');
                if ($input.maNext('md-icon').length) {
                    $container.addClass('md-icon-right');
                } else if ($input.maPrev('md-icon').length) {
                    $container.addClass('md-icon-left');
                }

                $input.after('<div class="md-errors-spacer">');
                
                containerCtrl.input = $input;
                if (!$input.attr('id')) {
                    $input.attr('id', 'input_' + maUtil.uuid());
                }
            }
        }
    }

    return {
        restrict: 'A',
        scope: false,
        require: {
            ngModelCtrl: 'ngModel',
            formCtrl: '?^^form',
            containerCtrl: '?^^mdInputContainer',
            dropDownCtrl: '?^^maDropDown'
        },
        controller: ConfigureInputContainerController,
        bindToController: true
    };
}

export default configureInputContainerDirective;
