/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class InscriptionsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Inscriptions
     * Retrieves a list of inscriptions with options to filter and sort results
     * @returns any Default Response
     * @throws ApiError
     */
    public getInscriptions({
        genesisBlock,
        fromGenesisBlockHeight,
        toGenesisBlockHeight,
        fromGenesisTimestamp,
        toGenesisTimestamp,
        fromSatOrdinal,
        toSatOrdinal,
        fromSatCoinbaseHeight,
        toSatCoinbaseHeight,
        fromNumber,
        toNumber,
        id,
        number,
        output,
        address,
        mimeType,
        rarity,
        offset,
        limit,
        orderBy,
        order,
    }: {
        /**
         * Bitcoin block identifier (height or hash)
         */
        genesisBlock?: string,
        /**
         * Bitcoin block height
         */
        fromGenesisBlockHeight?: string,
        /**
         * Bitcoin block height
         */
        toGenesisBlockHeight?: string,
        /**
         * Block UNIX epoch timestamp (milliseconds)
         */
        fromGenesisTimestamp?: number,
        /**
         * Block UNIX epoch timestamp (milliseconds)
         */
        toGenesisTimestamp?: number,
        /**
         * Ordinal number that uniquely identifies a satoshi
         */
        fromSatOrdinal?: number,
        /**
         * Ordinal number that uniquely identifies a satoshi
         */
        toSatOrdinal?: number,
        /**
         * Bitcoin block height
         */
        fromSatCoinbaseHeight?: string,
        /**
         * Bitcoin block height
         */
        toSatCoinbaseHeight?: string,
        /**
         * Inscription number
         */
        fromNumber?: number,
        /**
         * Inscription number
         */
        toNumber?: number,
        /**
         * Array of inscription IDs
         */
        id?: Array<string>,
        /**
         * Array of inscription numbers
         */
        number?: Array<number>,
        /**
         * An UTXO for a Bitcoin transaction
         */
        output?: string,
        /**
         * Array of Bitcoin addresses
         */
        address?: Array<string>,
        /**
         * Array of inscription MIME types
         */
        mimeType?: Array<string>,
        /**
         * Array of satoshi rarity values
         */
        rarity?: Array<('common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic')>,
        /**
         * Result offset
         */
        offset?: number,
        /**
         * Results per page
         */
        limit?: number,
        /**
         * Parameter to order results by
         */
        orderBy?: ('genesis_block_height' | 'ordinal' | 'rarity'),
        /**
         * Results order
         */
        order?: ('asc' | 'desc'),
    }): CancelablePromise<{
        limit: number;
        offset: number;
        total: number;
        results: Array<{
            id: string;
            number: number;
            address: (string | null);
            genesis_address: string;
            genesis_block_height: number;
            genesis_block_hash: string;
            genesis_tx_id: string;
            genesis_fee: string;
            genesis_timestamp: number;
            tx_id: string;
            location: string;
            output: string;
            value: (string | null);
            offset: (string | null);
            sat_ordinal: string;
            sat_rarity: string;
            sat_coinbase_height: number;
            mime_type: string;
            content_type: string;
            content_length: number;
            timestamp: number;
        }>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/ordinals/v1/inscriptions',
            query: {
                'genesis_block': genesisBlock,
                'from_genesis_block_height': fromGenesisBlockHeight,
                'to_genesis_block_height': toGenesisBlockHeight,
                'from_genesis_timestamp': fromGenesisTimestamp,
                'to_genesis_timestamp': toGenesisTimestamp,
                'from_sat_ordinal': fromSatOrdinal,
                'to_sat_ordinal': toSatOrdinal,
                'from_sat_coinbase_height': fromSatCoinbaseHeight,
                'to_sat_coinbase_height': toSatCoinbaseHeight,
                'from_number': fromNumber,
                'to_number': toNumber,
                'id': id,
                'number': number,
                'output': output,
                'address': address,
                'mime_type': mimeType,
                'rarity': rarity,
                'offset': offset,
                'limit': limit,
                'order_by': orderBy,
                'order': order,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }

    /**
     * Transfers per block
     * Retrieves a list of inscription transfers that ocurred at a specific Bitcoin block
     * @returns any Default Response
     * @throws ApiError
     */
    public getTransfersPerBlock({
        block,
        offset,
        limit,
    }: {
        /**
         * Bitcoin block identifier (height or hash)
         */
        block: string,
        /**
         * Result offset
         */
        offset?: number,
        /**
         * Results per page
         */
        limit?: number,
    }): CancelablePromise<{
        limit: number;
        offset: number;
        total: number;
        results: Array<{
            id: string;
            number: number;
            from: {
                block_height: number;
                block_hash: string;
                address: (string | null);
                tx_id: string;
                location: string;
                output: string;
                value: (string | null);
                offset: (string | null);
                timestamp: number;
            };
            to: {
                block_height: number;
                block_hash: string;
                address: (string | null);
                tx_id: string;
                location: string;
                output: string;
                value: (string | null);
                offset: (string | null);
                timestamp: number;
            };
        }>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/ordinals/v1/inscriptions/transfers',
            query: {
                'block': block,
                'offset': offset,
                'limit': limit,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }

    /**
     * Inscription
     * Retrieves a single inscription
     * @returns any Default Response
     * @throws ApiError
     */
    public getInscription({
        id,
    }: {
        /**
         * Inscription unique identifier (number or ID)
         */
        id: (string | number),
    }): CancelablePromise<{
        id: string;
        number: number;
        address: (string | null);
        genesis_address: string;
        genesis_block_height: number;
        genesis_block_hash: string;
        genesis_tx_id: string;
        genesis_fee: string;
        genesis_timestamp: number;
        tx_id: string;
        location: string;
        output: string;
        value: (string | null);
        offset: (string | null);
        sat_ordinal: string;
        sat_rarity: string;
        sat_coinbase_height: number;
        mime_type: string;
        content_type: string;
        content_length: number;
        timestamp: number;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/ordinals/v1/inscriptions/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }

    /**
     * Inscription content
     * Retrieves the contents of a single inscription
     * @returns any Default Response
     * @throws ApiError
     */
    public getInscriptionContent({
        id,
    }: {
        /**
         * Inscription unique identifier (number or ID)
         */
        id: (string | number),
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/ordinals/v1/inscriptions/{id}/content',
            path: {
                'id': id,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }

    /**
     * Inscription transfers
     * Retrieves all transfers for a single inscription
     * @returns any Default Response
     * @throws ApiError
     */
    public getInscriptionTransfers({
        id,
        offset,
        limit,
    }: {
        /**
         * Inscription unique identifier (number or ID)
         */
        id: (string | number),
        /**
         * Result offset
         */
        offset?: number,
        /**
         * Results per page
         */
        limit?: number,
    }): CancelablePromise<{
        limit: number;
        offset: number;
        total: number;
        results: Array<{
            block_height: number;
            block_hash: string;
            address: (string | null);
            tx_id: string;
            location: string;
            output: string;
            value: (string | null);
            offset: (string | null);
            timestamp: number;
        }>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/ordinals/v1/inscriptions/{id}/transfers',
            path: {
                'id': id,
            },
            query: {
                'offset': offset,
                'limit': limit,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }

}
