import * as Mustache from "mustache"
import { readerTemplate } from "./templates"
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
  PARAMETER_TYPE_PAYLOAD,
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
const PARAMETERS_PAYLOAD_SUFFIX = "PayloadParameters"

export interface SwaggerToTypescriptConverterSettings {
  allowVoidParameters?: boolean
  backend?: string
  targetPath?: string
  // template name or custom template path
  template?: "whatwg-fetch" | "superagent-request" | string
  mergeParam?: boolean
  customAgent?: string
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
        backend: "",
        template: "superagent-request",
        mergeParam: false,
      },
      settings || {}
    )
  }

  protected generatedDefinitions: string[] = []

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
      payloadParams,
    } = this.getParametersJarFactory().createFromOperation(operation)

    const parameterTypes: string[] = []

    const appendParameterTypes = (params, suffix): void => {
      if (this.settings.allowVoidParameters || params.length > 0) {
        const schema = this.getParametersArrayToSchemaConverter().convertToObject(
          params
        )
        parameterTypes.push(this.generateType(name + suffix, schema))
      }
    }

    if (this.settings.mergeParam) {
      appendParameterTypes(payloadParams, PARAMETERS_PAYLOAD_SUFFIX)
    } else {
      appendParameterTypes(queryParams, PARAMETERS_QUERY_SUFFIX)
      appendParameterTypes(bodyParams, PARAMETERS_BODY_SUFFIX)
      appendParameterTypes(formDataParams, PARAMETERS_FORM_DATA_SUFFIX)
      appendParameterTypes(headerParams, PARAMETERS_HEADER_SUFFIX)
    }

    return parameterTypes.join("\n")
  }

  public generateOperation(path: string, method: string, operation: Operation) {
    const name = this.getNormalizer().normalize(`${method}-${path}`)
    const {
      payloadParams,
      pathParams,
      queryParams,
      bodyParams,
      formDataParams,
      headerParams,
    } = this.getParametersJarFactory().createFromOperation(operation)

    let output = ""

    let parameters: string[] = []

    const payloadInType: string[] = []
    const payloadIn: { [key: string]: string[] } = {}

    if (!this.settings.mergeParam) {
      parameters = pathParams.map((parameter) => {
        return `${
          parameter.name
        }${PARAMETER_PATH_SUFFIX}: ${this.generateTypeValue(
          (parameter as any) as Schema
        )}`
      })
    }

    const args: Partial<Record<ParameterType, boolean>> = {
      // [PARAMETER_TYPE_PATH]: true,
    }

    const appendParametersArgs = (paramsType, params, paramsSuffix) => {
      if (this.settings.allowVoidParameters || params.length > 0) {
        if (this.settings.mergeParam) {
          if (paramsType === PARAMETER_TYPE_PAYLOAD) {
            parameters.push(`${paramsType}: ${name}${paramsSuffix}`)
            args[paramsType] = true
          } else {
            payloadIn[paramsType] = params.map((param) => param.name)
            if (!payloadInType.includes(paramsType)) {
              payloadInType.push(paramsType)
            }
          }
        } else {
          parameters.push(`${paramsType}: ${name}${paramsSuffix}`)
          args[paramsType] = true
        }
      }
    }

    if (this.settings.mergeParam) {
      appendParametersArgs(
        PARAMETER_TYPE_PAYLOAD,
        payloadParams,
        PARAMETERS_PAYLOAD_SUFFIX
      )
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

    output += Mustache.render(readerTemplate("singleMethod"), {
      // method summary
      summary: operation.summary || false,
      // method name
      name,
      // method parameters
      parameters: parameters.join(", "),
      payloadIn:
        Object.keys(payloadIn).length > 1
          ? JSON.stringify(payloadIn)
          : undefined,
      payloadInType: payloadInType.length === 1 ? payloadInType[0] : undefined,
      // request arguments(payload | query, body, formData)
      requestArgs: Object.keys(args).filter((arg) => args[arg]),
      // define path keyword const/let
      definePath: pathParams.length > 0 ? "let" : "const",
      path,
      pathParams,
      // decorate path params' name with curly braces
      pathParamName: function () {
        return `{${this.name}}`
      },
      method: method.toUpperCase(),
      responseTypes,
    })

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
      // const segments = definition.$ref.split("/")
      // const parameterName = segments[2]
      // const name = this.getNormalizer().normalize(parameterName)
      // const referred = this.swagger.definitions[parameterName]
      // if (!referred) {
      //   throw new Error(`cannot find reference ${definition.$ref}`)
      // }
      // if (this.generatedDefinitions.includes(name)) {
      //   return name
      // } else {
      //   this.generatedDefinitions.push(name)
      //   return this.generateTypeValue(referred)
      // }
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
            const defIn = def["in"]
            if (description) {
              output += `/** ${description} ${defIn ? `in ${defIn}` : ""} */\n`
            } else if (defIn) {
              output += `/** in ${defIn} */\n`
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
    let output = ""
    output += Mustache.render(readerTemplate("methodModule"), {
      RequestFactoryName: this.settings.template,
      customAgent: this.settings.customAgent,
      // base path
      baseUrl: this.settings.backend,
    })
    output += "\n"
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
