/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import permissionsPageTemplate from './permissionsPage.html';
import './permissionsPage.css';

const filterSearchKeys = ['moduleName', 'moduleDescription', 'description', 'name'];

class PermissionsPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maSystemPermission']; }
    
    constructor(maSystemPermission) {
        this.maSystemPermission = maSystemPermission;
    }
    
    $onInit() {
        this.getPermissions();
    }
    
    getPermissions() {
        this.maSystemPermission.buildQuery()
        .sort('moduleName', 'name')
        .query().then((permissions) => {
            this.permissions = permissions;
            this.filterPermissions();
        });
    }
    
    filterPermissions() {
        const modules = {};
        const filter = this.filter && this.filter.toLowerCase();
        
        this.permissions.filter(permission => {
            if (!filter) return true;
            return filterSearchKeys.some(k => permission[k].toLowerCase().includes(filter));
        }).forEach(permission => {
            let module = modules[permission.moduleName];
            if (!module) {
                module = modules[permission.moduleName] = {
                    name: permission.moduleName,
                    description: permission.moduleDescription,
                    permissions: []
                };
            }
            module.permissions.push(permission);
        });
        
        this.modules = Object.values(modules);
        
        const current = this.selectedModule && this.modules.find(m => m.name === this.selectedModule.name);
        if (current) {
            this.selectedModule = current;
        } else {
            this.selectedModule = this.modules[0];
        }
    }
    
    savePermission(permission) {
        const ngModelCtrl = this.form && this.form[permission.name];
        
        permission.save().then(() => {
            if (ngModelCtrl) {
                modelCtrl.$setValidity('validationMessage', true);
                delete modelCtrl.validationMessage;
            }
        }, error => {
            if (error.status === 422 && ngModelCtrl) {
                ngModelCtrl.$setValidity('validationMessage', false);
                ngModelCtrl.validationMessage = error.mangoStatusText;
            } else {
                // TODO notify
            }
        });
    }
}

export default {
    bindings: {
    },
    controller: PermissionsPageController,
    template: permissionsPageTemplate
};