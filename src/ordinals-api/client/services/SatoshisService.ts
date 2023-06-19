/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class SatoshisService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Satoshi Ordinal
     * Retrieves ordinal information for a single satoshi
     * @returns any Default Response
     * @throws ApiError
     */
    public getSatoshi({
        ordinal,
    }: {
        /**
         * Ordinal number that uniquely identifies a satoshi
         */
        ordinal: number,
    }): CancelablePromise<{
        coinbase_height: number;
        cycle: number;
        decimal: string;
        degree: string;
        inscription_id?: string;
        epoch: number;
        name: string;
        offset: number;
        percentile: string;
        period: number;
        rarity: ('common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic');
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/ordinals/v1/sats/{ordinal}',
            path: {
                'ordinal': ordinal,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }

}
