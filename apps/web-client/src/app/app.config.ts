import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CLIENT_FEAT_WEB_SHELL_ROUTES } from '@hazeyu-ordering-tool-client/client/feat-web-shell';
import { provideAppConfiguration } from '@hazeyu-ordering-tool-client/core/util-app-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(CLIENT_FEAT_WEB_SHELL_ROUTES),
    provideAppConfiguration({
      apiUrl: 'localhost:3000'
    })
  ],
};
