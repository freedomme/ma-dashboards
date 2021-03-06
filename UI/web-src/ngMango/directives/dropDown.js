/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maDropDown
 * @restrict E
 * @description
 */

/*
 * TODO
 * Additional way to define other elements which maintain the focus
 * (better) Way to disable animation
 * Set height according to position of element
 * 
 * window resizing is not resizing the drop down correctly
 * toggle is not working correctly due to focus being incorrect
 */

import angular from 'angular';
import './dropDown.css';

dropDown.$inject = ['$document', '$animate', '$window'];
function dropDown($document, $animate, $window) {
    
    const $body = $document.maFind('body');

    class DropDownController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$scope', '$element', '$attrs', '$transclude']; }
        
        constructor($scope, $element, $attrs, $transclude) {
            this.$scope = $scope;
            this.$element = $element;
            this.$attrs = $attrs;
            this.$transclude = $transclude;
            
            this.createOnInit = true;
            this.destroyOnClose = false;
            this.autoFocus = true;
            this.keydownListener = this.keydownListener.bind(this);
            this.scrollListener = this.scrollListener.bind(this);
            this.focusListener = this.focusListener.bind(this);
            this.resizeListener = this.resizeListener.bind(this);
            
            this.fullscreenMedia = '(max-width: 599px)';
        }
        
        $onChanges(changes) {
            if (changes.openOptions && !changes.openOptions.isFirstChange() && this.openOptions) {
                this.open(this.openOptions);
            }
        }
        
        $onInit() {
            $body[0].addEventListener('focus', this.focusListener, true);
            $window.addEventListener('resize', this.resizeListener, true);
            $window.addEventListener('scroll', this.scrollListener, true);

            if (this.createOnInit) {
                this.createElement();
            }
            
            if (this.openOptions) {
                this.open(this.openOptions);
            }
            
            if (this.dropDownButton) {
                this.dropDownButton.register(this);
            }
        }
        
        $destroy() {
            this.cancelAnimations();
            $body[0].removeEventListener('focus', this.focusListener, true);
            $window.removeEventListener('resize', this.resizeListener, true);
            $window.removeEventListener('scroll', this.scrollListener, true);
            
            this.destroyElement();
            
            if (this.dropDownButton) {
                this.dropDownButton.deregister(this);
            }
        }

        createElement() {
            this.$dropDown = this.$transclude((tClone, tScope) => {
                tScope.$dropDown = this;
                this.transcludeScope = tScope;
                
                // we could allow the drop down contents to find controllers from the parents
                //this.$element.after(tClone);
            }, $body);
            
            // detach the drop down contents
            //this.$dropDown.detach();
            
            this.$dropDown[0].addEventListener('keydown', this.keydownListener);
        }
        
        destroyElement() {
            if (this.$dropDown) {
                this.$dropDown.remove();
                delete this.$dropDown;
            }
            if (this.transcludeScope) {
                this.transcludeScope.$destroy();
                delete this.transcludeScope;
            }
        }

        isOpen() {
            return !!this.openAnimation;
        }

        open(options = {}) {
            this.openOptions = options;
            
            if (!this.$dropDown) {
                this.createElement();
            }
            
            const dropDownEl = this.$dropDown[0];

            if (options.targetElement) {
                this.targetElement = options.targetElement;
            } else if (options.targetEvent) {
                this.targetElement = options.targetEvent.target;
            } else {
                this.targetElement = this.$element.parent()[0];
            }
            this.resizeDropDown();

            if (!this.isOpen()) {
                this.cancelAnimations();

                $body.append(this.$dropDown);
                
                // trigger any virtual repeat directives to scroll back to the top
                dropDownEl.querySelectorAll('.md-virtual-repeat-scroller').forEach(e => {
                    e.scroll(0, 0);
                    e.dispatchEvent(new CustomEvent('scroll'));
                });

                this.openAnimation = $animate.addClass(this.$dropDown, 'ma-open');
                this.onOpen({$dropDown: this});
                this.transcludeScope.$broadcast('maDropDownOpen', this, this.openAnimation);
                
                this.openAnimation.then(() => {
                    if (this.autoFocus) {
                        this.focus();
                    }
                    this.onOpened({$dropDown: this});
                    this.transcludeScope.$broadcast('maDropDownOpened', this);
                }, error => {
                    // cancelled, dont care
                });
            }
        }
        
        close() {
            if (this.isOpen()) {
                this.cancelAnimations();
                
                // cant use $animate.leave as it removes the element (instead of detach), destroying its event handlers
                this.closeAnimation = $animate.removeClass(this.$dropDown, 'ma-open');
                this.onClose({$dropDown: this});
                this.transcludeScope.$broadcast('maDropDownClose', this, this.closeAnimation);

                // transfer focus back to the target element that opened the drop down (usually a ma-drop-down-button)
                if (this.hasFocus() && this.targetElement) {
                    this.targetElement.focus();
                }
                
                this.closeAnimation.then(() => {
                    const tScope = this.transcludeScope;
                    if (this.destroyOnClose) {
                        this.destroyElement();
                    } else {
                        this.$dropDown.detach();
                    }
                    tScope.$broadcast('maDropDownClosed', this);
                    this.onClosed({$dropDown: this});
                }, error => {
                    // cancelled, dont care
                });
            }
        }
        
        toggleOpen(options) {
            if (this.isOpen()) {
                this.close();
            } else {
                this.open(options);
            }
        }
        
        cancelAnimations() {
            if (this.openAnimation) {
                $animate.cancel(this.openAnimation);
                delete this.openAnimation;
            }
            if (this.closeAnimation) {
                $animate.cancel(this.closeAnimation);
                delete this.closeAnimation;
            }
        }
        
        resizeDropDown() {
            if (!this.targetElement || !this.$dropDown) return;

            const dropDownEl = this.$dropDown[0];
            
            this.fullscreen = $window.matchMedia(this.fullscreenMedia).matches;
            if (this.fullscreen) {
                Object.assign(dropDownEl.style, {
                    width: 'calc(100% - 16px)',
                    maxHeight: 'calc(100% - 16px)',
                    left: '8px',
                    right: '8px',
                    top: '8px',
                    bottom: '8px',
                    transformOrigin: '0 0'
                });
                return;
            }
            
            const rect = this.targetElement.getBoundingClientRect();
            dropDownEl.style.left = `${rect.left}px`;
            dropDownEl.style.width = `${rect.width}px`;
            
            const spaceAbove = rect.top;
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow > spaceAbove) {
                dropDownEl.style.top = `${spaceAbove + rect.height}px`;
                dropDownEl.style.bottom = null;
                dropDownEl.style.maxHeight = `${spaceBelow - 8}px`;
                dropDownEl.style.transformOrigin = '0 0';
            } else {
                dropDownEl.style.top = null;
                dropDownEl.style.bottom = `${spaceBelow + rect.height}px`;
                dropDownEl.style.maxHeight = `${spaceAbove - 8}px`;
                dropDownEl.style.transformOrigin = '0 100%';
            }
        }
        
        hasFocus() {
            return this.$dropDown.maHasFocus() || $body.maFind('.md-open-menu-container').maHasFocus() ||
                angular.element(this.targetElement).maHasFocus();
        }
        
        focusListener(event) {
            if (this.isOpen() && !this.hasFocus()) {
                // getting $digest already in progress errors due to AngularJS material triggering a focus event inside the $digest cycle
                if (this.$scope.$root.$$phase != null) {
                    this.close();
                } else {
                  this.$scope.$apply(() => {
                      this.close();
                  });
                }
            }
        }
        
        resizeListener(event) {
            clearTimeout(this.resizeDebounceTimeout);
            this.resizeDebounceTimeout = setTimeout(() => {
                this.resizeDropDown();
            }, 200);
        }
        
        scrollListener(event) {
            if (this.isOpen() && !this.$dropDown[0].contains(event.target)) {
                this.resizeDropDown();
            }
        }

        focus() {
            this.$dropDown.maFind('[autofocus], button, [href], input, select, textarea, [tabindex]')
                .maFocus({sort: true});
        }
        
        keydownListener(event) {
            if (event.key === 'Escape' && this.isOpen()) {
                event.stopPropagation();
                this.$scope.$apply(() => {
                    this.close();
                });
            }
        }
    }

    return {
        scope: {},
        restrict: 'E',
        transclude: 'element',
        terminal: true,
        priority: 599, // 1 lower than ngIf
        controller: DropDownController,
        bindToController: {
            openOptions: '<openDropDown',
            createOnInit: '<?',
            destroyOnClose: '<?',
            onOpen: '&',
            onOpened: '&',
            onClose: '&',
            onClosed: '&',
            autoFocus: '<?',
            fullscreenMedia: '@?fullscreen'
        },
        require: {
            dropDownButton: '?^^maDropDownButton',
            
            // allow access to input container and form from inside the drop down
            // (for those components which are aware of the drop down, e.g. ma-option-list)
            containerCtrl: '?^^mdInputContainer',
            formCtrl: '?^^form'
        }
    };
}

export default dropDown;