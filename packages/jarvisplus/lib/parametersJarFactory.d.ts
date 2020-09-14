import { Operation, Parameter, Spec } from "swagger-schema-official";
import { ParametersJar } from "./parametersJar";
import { ParameterType } from "./swaggerTypes";
export declare class ParametersJarFactory {
    protected swagger: Spec;
    constructor(swagger: Spec);
    createFromOperation(operation: Operation): ParametersJar;
    protected getOperationParameters(operation: Operation): Parameter[];
    protected getOperationParametersByType(operation: Operation, type: ParameterType): Parameter[];
    protected mapParameters(operation: Operation): (import("swagger-schema-official").BodyParameter | (import("swagger-schema-official").BaseParameter & import("swagger-schema-official").GenericFormat & import("swagger-schema-official").BaseSchema & {
        in: "query";
        allowEmptyValue?: boolean;
        collectionFormat?: import("swagger-schema-official").ParameterCollectionFormat;
    }) | (import("swagger-schema-official").BaseParameter & import("swagger-schema-official").GenericFormat & import("swagger-schema-official").BaseSchema & {
        in: "formData";
        type: import("swagger-schema-official").ParameterType;
        allowEmptyValue?: boolean;
        collectionFormat?: import("swagger-schema-official").ParameterCollectionFormat;
    } & {
        $ref: string;
    }) | (import("swagger-schema-official").BaseParameter & import("swagger-schema-official").GenericFormat & import("swagger-schema-official").BaseSchema & {
        in: "path";
        required: true;
    } & {
        $ref: string;
    }) | (import("swagger-schema-official").BaseParameter & import("swagger-schema-official").GenericFormat & import("swagger-schema-official").BaseSchema & {
        in: "header";
    } & {
        $ref: string;
    }))[];
    protected mapAuthorization(operation: Operation): import("swagger-schema-official").Security[];
}
