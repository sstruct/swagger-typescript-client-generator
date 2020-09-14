import { Operation, Schema, Spec } from "swagger-schema-official";
import { BaseConverter } from "./baseConverter";
import { Normalizer } from "./normalizer";
import { ParametersArrayToSchemaConverter } from "./parameterArrayToSchemaConverter";
import { ParametersJarFactory } from "./parametersJarFactory";
export declare const TYPESCRIPT_TYPE_UNDEFINED = "undefined";
export declare const TYPESCRIPT_TYPE_VOID = "void";
export declare const TYPESCRIPT_TYPE_ANY = "any";
export declare const TYPESCRIPT_TYPE_EMPTY_OBJECT = "{}";
export interface SwaggerToTypescriptConverterSettings {
    allowVoidParameters?: boolean;
    backend?: string;
    targetPath?: string;
    template?: "whatwg-fetch" | "superagent-request" | string;
    mergeParam?: boolean;
    customAgent?: string;
}
export declare class TypescriptConverter implements BaseConverter {
    protected swagger: Spec;
    protected settings?: SwaggerToTypescriptConverterSettings;
    protected normalizer: Normalizer;
    protected parametersJarFactory: ParametersJarFactory;
    protected parametersArrayToSchemaConverter: ParametersArrayToSchemaConverter;
    constructor(swagger: Spec, settings?: SwaggerToTypescriptConverterSettings);
    protected generatedDefinitions: string[];
    generateParameterTypesForOperation(path: string, method: string, operation: Operation): string;
    generateOperation(path: string, method: string, operation: Operation): string;
    generateType(name: string, definition: Schema): string;
    generateTypeValue(definition: Schema & {
        schema?: Schema;
    }): string;
    generateClient(name: string): string;
    getNormalizer(): Normalizer;
    getParametersJarFactory(): ParametersJarFactory;
    getParametersArrayToSchemaConverter(): ParametersArrayToSchemaConverter;
}
