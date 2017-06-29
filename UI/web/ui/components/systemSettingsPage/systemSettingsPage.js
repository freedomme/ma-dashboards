/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

SystemSettingsPageController.$inject = ['maSystemSettings', 'maLocales', 'maUser', '$state', 'maUiMenu', '$mdMedia',
	'$scope', '$timeout', 'maSystemActions', 'maDialogHelper', 'maServer'];
function SystemSettingsPageController(SystemSettings, maLocales, User, $state, maUiMenu, $mdMedia,
		$scope, $timeout, maSystemActions, maDialogHelper, maServer) {
    this.SystemSettings = SystemSettings;
    this.User = User;
    this.$state = $state;
    this.menu = maUiMenu;
    this.$mdMedia = $mdMedia;
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.maSystemActions = maSystemActions;
    this.maDialogHelper = maDialogHelper;
    this.maServer = maServer;
    
    maLocales.get().then(function(locales) {
        locales.forEach(function(locale) {
            locale.id = locale.id.replace('-', '_');
        });
        this.locales = locales;
    }.bind(this));
    
    this.systemAlarmLevelSettings = SystemSettings.getSystemAlarmLevelSettings();
    this.auditAlarmLevelSettings = SystemSettings.getAuditAlarmLevelSettings();
}

SystemSettingsPageController.prototype.$onChanges = function(changes) {
};

SystemSettingsPageController.prototype.$onInit = function() {
    this.$scope.$on('$viewContentLoading', function(event, viewName) {
        if (viewName === '@ui.settings.system') {
            if (this.settingForm) {
                // set form back to pristine state when changing between sections
                this.settingForm.$setPristine();
                this.settingForm.$setUntouched();
                this.changedValues = {};
                this.error = null;
                this.savedMessage = false;
                this.$timeout.cancel(this.savedMessageTimeout);
                delete this.savePromise;
            }
        }
    }.bind(this));
    
    this.SystemSettings.listPermissions().then(function(permissions) {
    	this.permissions = permissions;
    }.bind(this));
};

SystemSettingsPageController.prototype.triggerPurge = function(name) {
	var $ctrl = this;
	return function() {
		$ctrl.maSystemActions.trigger(name).then(function(triggerResult) {
			$ctrl.maDialogHelper.toastOptions({textTr: 'ui.app.purge.purgingStarted', hideDelay: 0});
			triggerResult.refreshUntilFinished().then(function(finishedResult) {
				var results = finishedResult.results;
				if (results.failed) {
					$ctrl.maDialogHelper.toastOptions({textTr: ['ui.app.purge.purgeFailed', results.exception.message], hideDelay: 10000, classes: 'md-warn'});
				} else {
					$ctrl.maDialogHelper.toastOptions({textTr: ['ui.app.purge.purgingEnded', results.deletedPointValues, results.deletedEvents]});
				}
			});
		}, function(error) {
			var msg = error.statusText + ' \u2014 ' + error.data.localizedMessage;
			$ctrl.maDialogHelper.toastOptions({textTr: ['ui.app.purge.startingPurgeFailed', msg], hideDelay: 10000, classes: 'md-warn'});
		});
	};
};

SystemSettingsPageController.prototype.sendTestEmail = function() {
    var $ctrl = this;
    this.User.current.sendTestEmail().then(function(response) {
        $ctrl.maDialogHelper.toastOptions({
    		text: response.data,
    		hideDelay: 10000
    	});
    }, function(error) {
    	$ctrl.maDialogHelper.toastOptions({
    		textTr: ['ui.components.errorSendingEmail', emailAddress],
    		hideDelay: 10000,
    		classes: 'md-warn'
    	});
    });
};

SystemSettingsPageController.prototype.confirm = function(event, onConfirmed, translation) {
	return this.maDialogHelper.confirm(event, translation).then(onConfirmed);
};

SystemSettingsPageController.prototype.valueChanged = function(systemSetting) {
    this.changedValues[systemSetting.key] = systemSetting.value;
};

SystemSettingsPageController.prototype.saveSection = function() {
    if (this.savePromise) return;
    
    this.$timeout.cancel(this.savedMessageTimeout);
    this.error = null;
    this.savedMessage = false;
    
    this.savePromise = this.SystemSettings.setValues(this.changedValues).then(function() {
        this.settingForm.$setPristine();
        this.settingForm.$setUntouched();
        this.changedValues = {};
        this.savedMessage = true;
        this.savedMessageTimeout = this.$timeout(function() {
            this.savedMessage = false;
        }.bind(this), 5000);
    }.bind(this), function(e) {
        this.error = {response: e};
        this.error.message = e.data && typeof e.data === 'object' && e.data.message;
        if (!this.error.message && e.statusText) this.error.message = e.statusText;
        if (!this.error.message) this.error.message = 'Unknown';
    }.bind(this)).then(function() {
        delete this.savePromise;
    }.bind(this));
};

SystemSettingsPageController.prototype.currentTime = function() {
	return Math.floor((new Date()).valueOf() / 1000);
};

SystemSettingsPageController.prototype.getBackupFiles = function() {
	return this.maServer.getSystemInfo('sqlDatabaseBackupFileList').then(function(list) {
		return (this.backupFiles = list);
	}.bind(this));
};

SystemSettingsPageController.prototype.doConfigBackup = function(event) {
	var $ctrl = this;
	return this.maDialogHelper.confirm(event, 'systemSettings.backupNow').then(function() {
		$ctrl.maSystemActions.trigger('backupConfiguration').then(function(triggerResult) {
			$ctrl.maDialogHelper.toastOptions({textTr: 'ui.app.backup.configBackupStarted', hideDelay: 0});
			triggerResult.refreshUntilFinished().then(function(finishedResult) {
				var results = finishedResult.results;
				if (results.failed) {
					$ctrl.maDialogHelper.toastOptions({textTr: ['ui.app.backup.configBackupFailed', results.exception.message], hideDelay: 10000, classes: 'md-warn'});
				} else {
					$ctrl.maDialogHelper.toastOptions({textTr: ['ui.app.backup.configBackupSuccess', results.backupFile]});
				}
			});
		}, function(error) {
			var msg = error.statusText + ' \u2014 ' + error.data.localizedMessage;
			$ctrl.maDialogHelper.toastOptions({textTr: ['ui.app.backup.configBackupStartingFailed', msg], hideDelay: 10000, classes: 'md-warn'});
		});
	});
};

SystemSettingsPageController.prototype.doSqlBackup = function(event) {
	var $ctrl = this;
	return this.maDialogHelper.confirm(event, 'systemSettings.backupNow').then(function() {
		$ctrl.maSystemActions.trigger('sqlBackup').then(function(triggerResult) {
			$ctrl.maDialogHelper.toastOptions({textTr: 'ui.app.backup.sqlBackupStarted', hideDelay: 0});
			triggerResult.refreshUntilFinished().then(function(finishedResult) {
				var results = finishedResult.results;
				if (results.failed) {
					$ctrl.maDialogHelper.toastOptions({textTr: ['ui.app.backup.sqlBackupFailed', results.exception.message], hideDelay: 10000, classes: 'md-warn'});
				} else {
					$ctrl.maDialogHelper.toastOptions({textTr: ['ui.app.backup.sqlBackupSuccess', results.backupFile]});
				}
			});
		}, function(error) {
			var msg = error.statusText + ' \u2014 ' + error.data.localizedMessage;
			$ctrl.maDialogHelper.toastOptions({textTr: ['ui.app.backup.sqlBackupStartingFailed', msg], hideDelay: 10000, classes: 'md-warn'});
		});
	});
};

SystemSettingsPageController.prototype.doSqlRestore = function(event, filename) {
	var $ctrl = this;
	return this.maDialogHelper.confirm(event, 'systemSettings.confirmRestoreDatabase').then(function() {
		$ctrl.maSystemActions.trigger('sqlRestore', {filename: filename}).then(function(triggerResult) {
			$ctrl.maDialogHelper.toastOptions({textTr: 'ui.app.backup.sqlRestoreStarted', hideDelay: 0});
			triggerResult.refreshUntilFinished().then(function(finishedResult) {
				var results = finishedResult.results;
				if (results.failed) {
					$ctrl.maDialogHelper.toastOptions({textTr: ['ui.app.backup.sqlRestoreFailed', results.exception.message], hideDelay: 10000, classes: 'md-warn'});
				} else {
					$ctrl.maDialogHelper.toastOptions({textTr: ['ui.app.backup.sqlRestoreSuccess']});
				}
			});
		}, function(error) {
			var msg = error.statusText + ' \u2014 ' + error.data.localizedMessage;
			$ctrl.maDialogHelper.toastOptions({textTr: ['ui.app.backup.sqlRestoreStartingFailed', msg], hideDelay: 10000, classes: 'md-warn'});
		});
	});
};

return {
    controller: SystemSettingsPageController,
    templateUrl: require.toUrl('./systemSettingsPage.html')
};

}); // define