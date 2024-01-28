import { Provider } from '@angular/core';
import { AppConfiguration, IAppConfiguration } from './app-configuration';

export const provideAppConfiguration = (config: IAppConfiguration): Provider => ({
    provide: AppConfiguration, 
    useFactory: () => new AppConfiguration(config)
});