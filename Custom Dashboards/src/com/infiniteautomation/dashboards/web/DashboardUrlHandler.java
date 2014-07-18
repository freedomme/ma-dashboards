/**
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */
package com.infiniteautomation.dashboards.web;

import java.io.File;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.springframework.web.servlet.View;

import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.web.mvc.UrlHandler;

/**
 * @author Terry Packer
 *
 */
public class DashboardUrlHandler implements UrlHandler{
	
	private String dashboardsBasePath;
	
	public DashboardUrlHandler(String modulePath){
		this.dashboardsBasePath = modulePath + "/web/pages/";
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.web.mvc.UrlHandler#handleRequest(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, java.util.Map)
	 */
	@Override
	public View handleRequest(HttpServletRequest request,
			HttpServletResponse response, Map<String, Object> model)
			throws Exception {
		
		//Here we would map to the pages by loading the view
		String contextPath = request.getRequestURI();
		//Load in the dashboard
		String[] parts = contextPath.split("/dashboards");
		
		File dashboard = new File(Common.MA_HOME + dashboardsBasePath + parts[1]);
		
		return new DashboardView(FileUtils.readFileToString(dashboard));

	}

	
    static class DashboardView implements View {
        private final String content;

        public DashboardView(String content) {
            this.content = content;
        }

        @Override
        public String getContentType() {
            return "text/html";
        }

        @Override
        public void render(@SuppressWarnings("rawtypes") Map model, HttpServletRequest request,
                HttpServletResponse response) throws Exception {
            response.getWriter().write(content);
        }
    }
    
    
    static class DashboardJavascriptResourceView implements View {
        private final String content;

        public DashboardJavascriptResourceView(String content) {
            this.content = content;
        }

        @Override
        public String getContentType() {
            return "application/javascript";
        }

        @Override
        public void render(@SuppressWarnings("rawtypes") Map model, HttpServletRequest request,
                HttpServletResponse response) throws Exception {
            response.getWriter().write(content);
        }
    }
}
