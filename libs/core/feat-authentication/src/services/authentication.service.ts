import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { AppConfiguration } from '@hazeyu-ordering-tool-client/core/util-app-config';
import { Observable } from "rxjs";

@Injectable()
export class AuthenticationService {
    private readonly httpClient = inject(HttpClient);
    private readonly appConfig = inject(AppConfiguration);

    public requestToken(): Observable<{}> {
        return this.httpClient.post(`${this.appConfig.apiUrl}/login`, {});
    }
}