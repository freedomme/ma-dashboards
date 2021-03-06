/**
 * Copyright (C) 2017 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.ui;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.github.zafarkhaja.semver.Version;
import com.infiniteautomation.mango.permission.MangoPermission;
import com.serotonin.m2m2.IMangoLifecycle;
import com.serotonin.m2m2.db.dao.JsonDataDao;
import com.serotonin.m2m2.module.ModuleElementDefinition;
import com.serotonin.m2m2.vo.json.JsonDataVO;
import com.serotonin.m2m2.vo.permission.PermissionHolder;
import com.serotonin.provider.Providers;

/**
 * @author Jared Wiltshire
 *
 */
public class UILifecycle extends ModuleElementDefinition {
    // must match variables defined in web/ui/app.js
    public static final String MA_UI_MENU_XID = "mangoUI-menu";
    public static final String MA_UI_PAGES_XID = "mangoUI-pages";
    public static final String MA_UI_SETTINGS_XID = "mangoUI-settings";

    private JsonNodeFactory nodeFactory;

    public UILifecycle() {
        this.nodeFactory = JsonNodeFactory.withExactBigDecimals(false);
    }

    @Override
    public void postInitialize(Version previousVersion, Version current) {

        /**
         * Add a startup task to run after the Audit system is ready
         */
        Providers.get(IMangoLifecycle.class).addStartupTask(() -> {
            installMenuData();
            installPageData();
            installSettingsData();
        });
    }

    public void installMenuData() {
        boolean isNew = false;
        JsonDataVO menu = JsonDataDao.getInstance().getByXid(MA_UI_MENU_XID);
        if (menu == null) {
            menu = new JsonDataVO();
            menu.setXid(MA_UI_MENU_XID);
            menu.setName("UI Menu");
            menu.setReadPermission(MangoPermission.createOrSet(PermissionHolder.USER_ROLE));
            isNew = true;
        }

        if (menu.getJsonData() == null) {
            ObjectNode object = nodeFactory.objectNode();
            object.set("menuItems", nodeFactory.arrayNode());
            menu.setJsonData(object);
        }

        if(isNew) {
            JsonDataDao.getInstance().insert(menu);
        }else {
            JsonDataDao.getInstance().update(menu.getId(), menu);
        }
    }

    public void installPageData() {
        boolean isNew = false;
        JsonDataVO pages = JsonDataDao.getInstance().getByXid(MA_UI_PAGES_XID);
        if (pages == null) {
            pages = new JsonDataVO();
            pages.setXid(MA_UI_PAGES_XID);
            pages.setName("UI Pages");
            pages.setReadPermission(MangoPermission.createOrSet(PermissionHolder.USER_ROLE));
            isNew = true;
        }

        if (pages.getJsonData() == null) {
            ObjectNode object = nodeFactory.objectNode();
            object.set("pages", nodeFactory.arrayNode());
            pages.setJsonData(object);
        }

        if(isNew) {
            JsonDataDao.getInstance().insert(pages);
        }else {
            JsonDataDao.getInstance().update(pages.getId(), pages);
        }
    }

    public void installSettingsData() {
        boolean isNew = false;
        JsonDataVO settings = JsonDataDao.getInstance().getByXid(MA_UI_SETTINGS_XID);
        if (settings == null) {
            settings = new JsonDataVO();
            settings.setXid(MA_UI_SETTINGS_XID);
            settings.setName("UI Settings");
            settings.setReadPermission(MangoPermission.createOrSet(PermissionHolder.ANONYMOUS_ROLE));
            isNew = true;
        }

        if (settings.getJsonData() == null) {
            ObjectNode object = nodeFactory.objectNode();
            settings.setJsonData(object);
        }

        if(isNew) {
            JsonDataDao.getInstance().insert(settings);
        }else {
            JsonDataDao.getInstance().update(settings.getId(), settings);
        }
    }
}
