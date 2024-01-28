import { Route } from "@angular/router";
import { WebShellSmartComponent } from "./components/smart/web-shell/web-shell.smart-component";


export const CLIENT_FEAT_WEB_SHELL_ROUTES: Route[] = [
    {
        path: '',
        component: WebShellSmartComponent
    },
    {
        path: 'login',
        loadComponent: () => import('@hazeyu-ordering-tool-client/core/feat-authentication').then((m) => m.LoginSmartComponent)
    }
]