/**
 * Copyright 2013 ArcBees Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

package com.arcbees.website.assets.client.gin;

import javax.inject.Inject;

import com.arcbees.website.assets.client.resource.forkOnGithub.ForkOnGithubResource;
import com.google.gwt.dom.client.StyleInjector;

public class ForkOnGithubResourcesLoader {
    @Inject
    public ForkOnGithubResourcesLoader(ForkOnGithubResource forkOnGithubResource) {
        forkOnGithubResource.forkOnGithub_style().ensureInjected();

        String mediaCss = "@media only screen and (max-width: 1320px), only screen and (max-device-width: 1320px) {"
                + forkOnGithubResource.forkOnGithub_mediascreen().getText() + "}";
        StyleInjector.injectAtEnd(mediaCss);
    }
}
