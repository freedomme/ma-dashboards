/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import menuEditorTemplate from './menuEditor.html';
import angular from 'angular';

menuEditor.$inject = ['maUiMenu', '$mdDialog', 'maTranslate', '$mdMedia', 'maUiMenuEditor'];
function menuEditor(Menu, $mdDialog, Translate, $mdMedia, maUiMenuEditor) {
    return {
        scope: {},
        template: menuEditorTemplate,
        link: function($scope, $element) {
            $scope.menuEditor = {};
            $scope.$mdMedia = $mdMedia;

            function scrollToTopOfMdContent() {
                let elem = $element[0];
                while ((elem = elem.parentElement)) {
                    if (elem.tagName === 'MD-CONTENT') {
                        elem.scrollTop = 0;
                        break;
                    }
                }
            }

            $scope.getHierarchy = function getHierarchy() {
                Menu.getMenuHierarchy().then(setHierarchy);
            };
            $scope.getHierarchy();
            
            function setHierarchy(menuHierarchy) {
                $scope.menuHierarchy = menuHierarchy;
                $scope.path = [];
                $scope.enterSubmenu(null, $scope.menuHierarchy);
                
                let uiItem;
                $scope.menuHierarchy.children.some(function(item) {
                    return (uiItem = item.name === 'ui' && item);
                });
                
                if (uiItem) {
                    $scope.enterSubmenu(null, uiItem);
                }
            }

            $scope.enterSubmenu = function enterSubmenu(event, menuItem) {
                $scope.path.push(menuItem);
                $scope.currentItem = menuItem;
                $scope.getChildren();
                scrollToTopOfMdContent();
            };
            
            $scope.goToIndex = function goUp(event, index) {
                $scope.path.splice(index+1, $scope.path.length - 1 - index);
                $scope.currentItem = $scope.path[$scope.path.length-1];
                $scope.getChildren();
                scrollToTopOfMdContent();
            };
            
            $scope.getChildren = function getChildren() {
                if (!$scope.currentItem.children) {
                    $scope.editItems = [];
                    return;
                }
                
                // sort items by weight then name
                $scope.editItems = $scope.currentItem.children.sort(function(a, b) {
                    if (a.weight < b.weight) return -1;
                    if (a.weight > b.weight) return 1;
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
            };

            // updates the weights, attempting to keep them as close as possible to the original array
            $scope.updateWeights = function(event, ui) {
                let weight = -Infinity;
                $scope.currentItem.children.forEach(function(item, index, array) {
                    if (item.weight > weight) {
                        weight = item.weight;
                    } else {
                        if (index !== 0 && array[index - 1].name > item.name) {
                            weight++;
                        }
                        item.weight = weight;
                    }
                });
            };
            
            // ui sortable moves the items within the array, need to specify a call back that updates the
            // weight property
            $scope.uiSortableOptions = {
                handle: '> td > .move-handle',
                stop: $scope.updateWeights
            };
            
            $scope.deleteCustomMenu = function deleteCustomMenu(event) {
                const confirm = $mdDialog.confirm()
                    .title(Translate.trSync('ui.app.areYouSure'))
                    .textContent(Translate.trSync('ui.app.confirmRestoreDefaultMenu'))
                    .ariaLabel(Translate.trSync('ui.app.areYouSure'))
                    .targetEvent(event)
                    .ok(Translate.trSync('common.ok'))
                    .cancel(Translate.trSync('common.cancel'));
                
                $mdDialog.show(confirm).then(function() {
                    Menu.deleteMenu().then(setHierarchy);
                });
            };

            $scope.removeItem = function(toBeRemoved) {
                $scope.editItems.some(function(item, index, array) {
                    if (toBeRemoved.name === item.name) {
                        array.splice(index, 1);
                        return true;
                    }
                });
            };

            $scope.editItem = function($event, origItem) {
                if (!origItem) {
                    origItem = {
                        isNew: true,
                        name: $scope.currentItem.name ? $scope.currentItem.name + '.' : '',
                        url: '/',
                        parent: $scope.currentItem,
                        linkToPage: true,
                        permission: 'user'
                    };
                }

                const parent = origItem.parent;
                const isNew = origItem.isNew;
                
                maUiMenuEditor.editMenuItem($event, $scope.menuHierarchy, origItem).then(function(item) {
                    const newParent = item.parent;
                    
                    // remove item from the original parent's children if it was deleted or moved
                    if (!isNew && (item.deleted || parent !== newParent)) {
                        parent.children.some(function(item, i, array) {
                            if (item.name === origItem.name) {
                                return array.splice(i, 1);
                            }
                        });
                        if (!parent.children.length) {
                            delete parent.children;
                        }
                        if (item.deleted) {
                            return;
                        }
                    }

                    // copy item properties back onto original item
                    if (!isNew) {
                        const children = origItem.children;
                        
                        // update child state names
                        if (item.name !== origItem.name) {
                            Menu.forEach(children, function(child) {
                                const search = origItem.name + '.';
                                if (child.name.indexOf(search) === 0) {
                                    child.name = item.name + '.' + child.name.substring(search.length);
                                } else {
                                    console.warn('child has invalid name', child);
                                }
                            });
                        }
                        
                        // prevent stack overflow from cyclic copy of children/parent
                        delete item.children;
                        delete item.parent;
                        
                        item = angular.copy(item, origItem);
                        
                        // set the original children/parent back on the item
                        item.children = children;
                        item.parent = newParent;
                    }

                    // add item back into new parent's children
                    if (isNew || parent !== newParent) {
                        if (!newParent.children)
                            newParent.children = [];
                        newParent.children.push(item);
                    }
                    
                    // sorts array in case of new item added
                    $scope.getChildren();
                }, () => null);
            };
            
            $scope.saveMenu = function saveMenu() {
                Menu.saveMenu($scope.menuHierarchy).then(setHierarchy);
            };
        }
    };
}

export default menuEditor;


