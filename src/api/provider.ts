type Fetch = typeof window.fetch

export interface APIProvider {
    /**
     * Call an API endpoint and return the response.
     * Provider is responsible for JSON encoding the params and decoding the response.
     * @argument path The endpoint path, e.g. `/v1/chain/get_info`
     * @argument params The request body if any.
     */
    call(path: string, params?: unknown): Promise<unknown>
}

export interface FetchProviderOptions {
    /**
     * Fetch instance, must be provided in non-browser environments.
     * You can use the node-fetch package in Node.js.
     */
    fetch?: Fetch
}

/** Default provider that uses the Fetch API to call a single node. */
export class FetchProvider implements APIProvider {
    readonly url: string
    readonly fetch: Fetch

    constructor(url: string, options: FetchProviderOptions = {}) {
        url = url.trim()
        if (url.endsWith('/')) url = url.slice(0, -1)
        this.url = url
        if (!options.fetch) {
            if (typeof window !== 'undefined' && window.fetch) {
                this.fetch = window.fetch.bind(window)
            } else if (typeof global !== 'undefined' && global.fetch) {
                this.fetch = global.fetch.bind(global)
            } else {
                throw new Error('Missing fetch')
            }
        } else {
            this.fetch = options.fetch
        }
    }

    async call(path: string, params?: unknown) {
        const url = this.url + path
        const response = await this.fetch(url, {
            method: 'POST',
            body: params !== undefined ? JSON.stringify(params) : undefined,
        })
        if (!response.ok) {
            console.log((await response.json()).error)
            throw Error('Not ok')
        }
        return response.json()
    }
}
