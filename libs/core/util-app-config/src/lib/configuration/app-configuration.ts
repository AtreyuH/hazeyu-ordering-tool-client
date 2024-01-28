
export interface IAppConfiguration {
    apiUrl: string;
}

export class AppConfiguration implements IAppConfiguration {
    apiUrl: string = '';

    public constructor(config: IAppConfiguration) {
        Object.assign(this, config);
    }
}