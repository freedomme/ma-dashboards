/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

validationMessages.$inject = ['maUtil'];
function validationMessages(Util) {

    class ValidationMessagesController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return []; }
        
        constructor() {
        }
        
        $onInit() {
            // use a validator that always returns true so that when a user changes the input the error is always cleared
            const allwaysValidate = () => true;

            // convenience methods added to ngFormController
            this.ngFormCtrl.activateTabWithClientError = () => {
                this.activateTabWithClientError();
            };
            this.ngFormCtrl.setValidationMessageValidity = validity => {
                this.setValidationMessageValidity(validity);
            };
            
            // add validators to every control in this form so that when the input is changed validationMessage gets set to valid
            this.ngFormCtrl.$getControls().forEach(control => {
                if (control.$validators) {
                    control.$validators.validationMessage = allwaysValidate;
                }
            });
            
            const addControl = this.ngFormCtrl.$addControl;
            const newAddControl = function(control) {
                if (control.$validators) {
                    control.$validators.validationMessage = allwaysValidate;
                } else if (typeof control.$getControls === 'function') {
                    control.$addControl = newAddControl;
                }
                return addControl.apply(this, arguments);
            };
            this.ngFormCtrl.$addControl = newAddControl;
            
            this.checkMessages();
        }
        
        $onChanges(changes) {
            if (changes.messagesArray && !changes.messagesArray.isFirstChange()) {
                this.checkMessages();
            }
        }
        
        activateTabWithClientError() {
            Object.values(this.ngFormCtrl.$error).some(ctrls => {
                return ctrls.some(ctrl => {
                    this.activateTab(ctrl.$$element[0]);
                    return true;
                });
            });
        }
        
        activateTabWithValidationError() {
            if (!Array.isArray(this.messagesArray)) return;
            
            const withProperty = this.messagesArray.filter(m => m.property);
            if (withProperty.length) {
                const property = withProperty[0].property;
                const inputElement = Util.findInputElement(property, this.ngFormCtrl);
                this.activateTab(inputElement);
            }
        }
        
        activateTab(query) {
            if (!query) return;
            
            const formElement = this.ngFormCtrl.$$element[0];
            const tabElements = formElement.querySelectorAll('md-tab-content');

            const index = Array.prototype.findIndex.call(tabElements, tab => {
                if (query instanceof Node) {
                    return tab.contains(query);
                }
                
                return !!tab.querySelector(query);
            });
            
            if (index >= 0 && typeof this.activateTabCallback === 'function') {
                this.activateTabCallback({$index: index});
            }
        }

        checkMessages() {
            this.messages = {};
            const messagesArray = Array.isArray(this.messagesArray) ? this.messagesArray : [];
            
            messagesArray.forEach(item => {
                // standardize path from segment[1].test to segment.1.test
                const path = Util.splitPropertyName(item.property).join('.');
                let messages = this.messages[path];
                if (!messages) {
                    messages = this.messages[path] = [];
                }
                messages.push(item.message);
            });

            this.checkControls();
            this.activateTabWithValidationError();
        }
        
        checkControls(control = this.ngFormCtrl, parentPath = null) {
            const path = !parentPath ? [] : parentPath.concat(Util.splitControlName(control));
            
            const isForm = typeof control.$getControls === 'function';
            if (isForm) {
                control.$getControls().forEach(child => {
                    this.checkControls(child, path);
                });
            }
            
            let messages;
            if (path.length) {
                messages = this.messages[path.join('.')];
            } else if (control === this.ngFormCtrl) {
                messages = this.messages[''];
            }

            if (messages && messages.length) {
                const message = this.multipleMessages ? messages.join('\n') : messages[0];
                control.validationMessage = message;
                // only set inputs to invalid
                if (!isForm) {
                    control.$setValidity('validationMessage', false);
                }
            } else {
                delete control.validationMessage;
                if (!isForm) {
                    control.$setValidity('validationMessage', true);
                }
            }
        }
        
        setValidationMessageValidity(validity, control = this.ngFormCtrl) {
            if (typeof control.$getControls === 'function') {
                control.$getControls().forEach(child => {
                    this.setValidationMessageValidity(validity, child);
                });
            } else {
                control.$setValidity('validationMessage', validity);
            }
        }
    }

    return {
        restrict: 'A',
        bindToController: {
            messagesArray: '<maValidationMessages',
            multipleMessages: '<?',
            activateTabCallback: '&?maActivateTab'
        },
        require: {
            ngFormCtrl: 'form'
        },
        controller: ValidationMessagesController
    };
}

export default validationMessages;
