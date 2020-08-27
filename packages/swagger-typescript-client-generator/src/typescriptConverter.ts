import { Operation, Schema, Spec } from "swagger-schema-official"
import { BaseConverter } from "./baseConverter"
import { Normalizer } from "./normalizer"
import { ParametersArrayToSchemaConverter } from "./parameterArrayToSchemaConverter"
import { ParametersJarFactory } from "./parametersJarFactory"
import {
  ParameterType,
  DEFINITION_TYPE_ARRAY,
  DEFINITION_TYPE_BOOLEAN,
  DEFINITION_TYPE_ENUM,
  DEFINITION_TYPE_INTEGER,
  DEFINITION_TYPE_NUMBER,
  DEFINITION_TYPE_OBJECT,
  DEFINITION_TYPE_STRING,
  PARAMETER_TYPE_BODY,
  PARAMETER_TYPE_FORM_DATA,
  PARAMETER_TYPE_HEADER,
  PARAMETER_TYPE_PATH,
  PARAMETER_TYPE_QUERY,
} from "./swaggerTypes"
import { TypescriptNameNormalizer } from "./typescriptNameNormalizer"

export const TYPESCRIPT_TYPE_UNDEFINED = "undefined"
export const TYPESCRIPT_TYPE_VOID = "void"
export const TYPESCRIPT_TYPE_ANY = "any"
export const TYPESCRIPT_TYPE_EMPTY_OBJECT = "{}"

const PARAMETER_PATH_SUFFIX = "PathParameter"
const PARAMETERS_QUERY_SUFFIX = "QueryParameters"
const PARAMETERS_BODY_SUFFIX = "BodyParameters"
const PARAMETERS_FORM_DATA_SUFFIX = "FormDataParameters"
const PARAMETERS_HEADER_SUFFIX = "HeaderParameters"

export interface SwaggerToTypescriptConverterSettings {
  allowVoidParameters?: boolean
  gatewayPrefix?: string
  targetPath?: string
}

export class TypescriptConverter implements BaseConverter {
  protected normalizer: Normalizer = new TypescriptNameNormalizer()
  protected parametersJarFactory: ParametersJarFactory = new ParametersJarFactory(
    this.swagger
  )
  protected parametersArrayToSchemaConverter: ParametersArrayToSchemaConverter = new ParametersArrayToSchemaConverter()

  public constructor(
    protected swagger: Spec,
    protected settings?: SwaggerToTypescriptConverterSettings
  ) {
    this.settings = Object.assign(
      {},
      {
        allowVoidParameters: true,
        gatewayPrefix: "",
      },
      settings || {}
    )
  }

  public generateParameterTypesForOperation(
    path: string,
    method: string,
    operation: Operation
  ): string {
    const name = this.getNormalizer().normalize(`${method}-${path}`)

    const {
      queryParams,
      bodyParams,
      formDataParams,
      headerParams,
    } = this.getParametersJarFactory().createFromOperation(operation)

    const parameterTypes: string[] = []

    if (this.settings.allowVoidParameters || queryParams.length > 0) {
      const schema = this.getParametersArrayToSchemaConverter().convertToObject(
        queryParams
      )
      parameterTypes.push(
        this.generateType(name + PARAMETERS_QUERY_SUFFIX, schema)
      )
    }
    if (this.settings.allowVoidParameters || bodyParams.length > 0) {
      const schema = this.getParametersArrayToSchemaConverter().convertToUnion(
        bodyParams
      )
      parameterTypes.push(
        this.generateType(name + PARAMETERS_BODY_SUFFIX, schema)
      )
    }
    if (this.settings.allowVoidParameters || formDataParams.length > 0) {
      const schema = this.getParametersArrayToSchemaConverter().convertToUnion(
        formDataParams
      )
      parameterTypes.push(
        this.generateType(name + PARAMETERS_FORM_DATA_SUFFIX, schema)
      )
    }
    if (this.settings.allowVoidParameters || headerParams.length > 0) {
      const schema = this.getParametersArrayToSchemaConverter().convertToObject(
        headerParams
      )
      parameterTypes.push(
        this.generateType(name + PARAMETERS_HEADER_SUFFIX, schema)
      )
    }

    return parameterTypes.join("\n")
  }

  public generateOperation(path: string, method: string, operation: Operation) {
    const name = this.getNormalizer().normalize(`${method}-${path}`)
    const {
      pathParams,
      queryParams,
      bodyParams,
      formDataParams,
      headerParams,
    } = this.getParametersJarFactory().createFromOperation(operation)

    let output = ""

    const parameters: string[] = pathParams.map((parameter) => {
      return `${
        parameter.name
      }${PARAMETER_PATH_SUFFIX}: ${this.generateTypeValue(
        (parameter as any) as Schema
      )}`
    })
    const args: Partial<Record<ParameterType, boolean>> = {
      [PARAMETER_TYPE_PATH]: true,
    }

    const appendParametersArgs = (paramsType, params, paramsSuffix) => {
      if (this.settings.allowVoidParameters || params.length > 0) {
        parameters.push(`${paramsType}: ${name}${paramsSuffix}`)
        args[paramsType] = true
      }
    }

    appendParametersArgs(
      PARAMETER_TYPE_QUERY,
      queryParams,
      PARAMETERS_QUERY_SUFFIX
    )
    appendParametersArgs(
      PARAMETER_TYPE_BODY,
      bodyParams,
      PARAMETERS_BODY_SUFFIX
    )
    appendParametersArgs(
      PARAMETER_TYPE_FORM_DATA,
      formDataParams,
      PARAMETERS_FORM_DATA_SUFFIX
    )
    appendParametersArgs(
      PARAMETER_TYPE_HEADER,
      headerParams,
      PARAMETERS_HEADER_SUFFIX
    )

    const responseTypes =
      Object.entries(operation.responses || {})
        .map(([code, response]) => {
          return this.generateTypeValue(response)
        })
        .filter(
          (value, index, self) =>
            self.indexOf(value) === index && value !== "any"
        )
        .join(" | ") || TYPESCRIPT_TYPE_VOID

    if (operation.summary) {
      output += `/** ${operation.summary} */\n`
    }
    output += `export const ${name} = (${parameters.join(
      ", "
    )}): Promise<ApiResponse<${responseTypes}>> => {\n`

    output += `${pathParams.length > 0 ? "let" : "const"} path = '${
      this.settings.gatewayPrefix ? `/${this.settings.gatewayPrefix}` : ""
    }${path}'\n`

    output += pathParams
      .map((parameter) => {
        return `path = path.replace('{${parameter.name}}', String(${parameter.name}${PARAMETER_PATH_SUFFIX}))\n`
      })
      .join("\n")

    output += "return request({"
    Object.keys(args).map((arg) => {
      output += args[arg] ? `${arg},` : ""
    })
    output += `
      method: '${method.toUpperCase()}',
      configuration
    })`

    output += "}\n"

    return output
  }

  public generateType(name: string, definition: Schema): string {
    return `export type ${this.getNormalizer().normalize(
      name
    )} = ${this.generateTypeValue(definition)}\n`
  }

  public generateTypeValue(definition: Schema & { schema?: Schema }): string {
    if (definition.schema) {
      return this.generateTypeValue(definition.schema)
    }

    if (definition.$ref) {
      return this.getNormalizer().normalize(
        definition.$ref.substring(definition.$ref.lastIndexOf("/") + 1)
      )
    }

    if (Array.isArray(definition.allOf) && definition.allOf.length > 0) {
      return (
        definition.allOf
          .map((schema) => this.generateTypeValue(schema))
          .join(" & ") || TYPESCRIPT_TYPE_VOID
      )
    }

    switch (definition.type) {
      case DEFINITION_TYPE_STRING: {
        if (definition.enum) {
          return `'${definition.enum.join("' | '")}'`
        }
        return definition.type
      }
      case DEFINITION_TYPE_NUMBER:
      case DEFINITION_TYPE_BOOLEAN: {
        return definition.type
      }
      case DEFINITION_TYPE_INTEGER: {
        return DEFINITION_TYPE_NUMBER
      }
      case DEFINITION_TYPE_ARRAY: {
        return `Array<${this.generateTypeValue(definition.items as Schema)}>`
      }
    }

    if (
      definition.type === DEFINITION_TYPE_OBJECT ||
      (!definition.type &&
        (definition.allOf ||
          definition.properties ||
          definition.additionalProperties))
    ) {
      let output = ""

      const hasProperties =
        definition.properties && Object.keys(definition.properties).length > 0

      if (hasProperties) {
        output += "{\n"
        output += Object.entries(definition.properties)
          .map(([name, def]) => {
            let output = ""
            const isRequired = (definition.required || []).indexOf(name)
            const description = def.description
            if (description) {
              output += `/** ${description} */\n`
            }
            output += `'${name}'${
              isRequired ? "?" : ""
            }: ${this.generateTypeValue(def)}`
            return output
          })
          .join("\n")
        output += "\n}"
      }

      if (
        definition.additionalProperties &&
        typeof definition.additionalProperties === "object"
      ) {
        if (hasProperties) {
          output += " & "
        }
        output +=
          `{ [key: string]: ` +
          this.generateTypeValue(definition.additionalProperties) +
          " }"
      }

      if (output.trim().length === 0) {
        return TYPESCRIPT_TYPE_EMPTY_OBJECT
      }
      return output
    }

    return TYPESCRIPT_TYPE_ANY
  }

  public generateClient(name: string): string {
    let output = `
import { WhatWgFetchRequestFactory } from "swagger-typescript-client-generator-runtime/lib/whatwg-fetch"
const request = WhatWgFetchRequestFactory('retail-mall/admin-web', { requestInit: {} })
const configuration = {}

export interface ApiResponse<T> extends Response {
  json (): Promise<T>
}

export type RequestFactoryType = ({
  path,
  query,
  body,
  formData,
  headers,
  method,
  configuration,
}: {
  path: string;
  query?: any;
  body?: any;
  formData?: any;
  headers?: any;
  method: string;
  configuration: any;
}) => Promise<ApiResponse<any>>;

`
    output += Object.entries(this.swagger.paths)
      .map(([path, methods]) => {
        return Object.entries(methods)
          .map(([method, operation]) => {
            return this.generateOperation(path, method, operation)
          })
          .join("\n")
      })
      .join("\n")
    return output
  }

  public getNormalizer(): Normalizer {
    return this.normalizer
  }

  public getParametersJarFactory(): ParametersJarFactory {
    return this.parametersJarFactory
  }

  public getParametersArrayToSchemaConverter(): ParametersArrayToSchemaConverter {
    return this.parametersArrayToSchemaConverter
  }
}
