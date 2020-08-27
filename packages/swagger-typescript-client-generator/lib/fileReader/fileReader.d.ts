import { FileReaderOptions } from "./options";
import { Spec } from "swagger-schema-official";
export declare type FileReader<T = Spec> = (options: FileReaderOptions) => T;
export declare type ConfigType = {
    swaggers: {
        swagger_url: string;
        alias: string;
        backend: string;
        target_path: string;
    }[];
    target_language: "ts" | "js";
    template: "fetch" | "superagent";
    check_api: boolean;
    ignore_alias: boolean;
    need_mock: boolean;
    gateway_url: string;
    modelFolder: boolean;
};
