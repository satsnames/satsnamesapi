/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { AxiosHttpRequest } from './core/AxiosHttpRequest';

import { InscriptionsService } from './services/InscriptionsService';
import { SatoshisService } from './services/SatoshisService';
import { StatusService } from './services/StatusService';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class Ordinals {

    public readonly inscriptions: InscriptionsService;
    public readonly satoshis: SatoshisService;
    public readonly status: StatusService;

    public readonly request: BaseHttpRequest;

    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = AxiosHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'https://api.hiro.so',
            VERSION: config?.VERSION ?? '0.1.2',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });

        this.inscriptions = new InscriptionsService(this.request);
        this.satoshis = new SatoshisService(this.request);
        this.status = new StatusService(this.request);
    }
}

