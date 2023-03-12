/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class StatusService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * API Status
     * Displays the status of the API
     * @returns any Default Response
     * @throws ApiError
     */
    public getOrdinalsV1(): CancelablePromise<{
        server_version: string;
        status: string;
        block_height?: number;
        max_inscription_number?: number;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/ordinals/v1/',
        });
    }

}
