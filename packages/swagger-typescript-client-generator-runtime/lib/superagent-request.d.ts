import * as request from "superagent";
export declare type RequestFactoryType = ({ path, payload, payloadIn, payloadInType, query, body, formData, headers, method, }: {
    path: string;
    payload?: any;
    payloadIn?: any;
    payloadInType?: string;
    query?: any;
    body?: any;
    formData?: any;
    headers?: any;
    method: string;
}) => Promise<any>;
export declare type SuperagentFunctionType = (input: RequestInfo, init?: RequestInit) => Promise<request.Response>;
export interface SuperagentRequestFactoryOptions {
    request?: request.SuperAgentRequest;
    onResponse?(any: any): any;
    onError?(any: any): any;
}
declare const SuperagentRequestFactory: (baseUrl: string, options: SuperagentRequestFactoryOptions) => RequestFactoryType;
export default SuperagentRequestFactory;
