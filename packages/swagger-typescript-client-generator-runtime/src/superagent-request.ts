import * as request from "superagent"

export type RequestFactoryType = ({
  path,
  payload,
  payloadIn,
  query,
  body,
  formData,
  headers,
  method,
}: {
  path: string
  payload?: any
  payloadIn?: any
  query?: any
  body?: any
  formData?: any
  headers?: any
  method: string
}) => Promise<request.Response>

export type SuperagentFunctionType = (
  input: RequestInfo,
  init?: RequestInit
) => Promise<request.Response>

export interface SuperagentRequestFactoryOptions {
  request?: request.SuperAgentRequest

  onResponse?(any): any

  onError?(any): any
}

const getParametersFromPayloadWithParamNames = (
  payload: any,
  paramNames: string[]
) => {
  if (!Array.isArray(paramNames)) return
  const parameters = {}
  paramNames.forEach((name) => {
    if (Object.hasOwnProperty.call(payload, name)) {
      parameters[name] = payload[name]
    }
  })
  return parameters
}

const SuperagentRequestFactory = (
  baseUrl: string,
  options: SuperagentRequestFactoryOptions
): RequestFactoryType => ({
  path,
  payload,
  payloadIn,
  query,
  body,
  formData,
  method,
  headers,
}) => {
  if (payloadIn) {
    Object.keys(payloadIn).forEach((payloadType) => {
      switch (payloadType) {
        case "query":
          query = getParametersFromPayloadWithParamNames(
            payload,
            payloadIn[payloadType]
          )
          break
        case "body":
          body = getParametersFromPayloadWithParamNames(
            payload,
            payloadIn[payloadType]
          )
          break
        case "headers":
          headers = getParametersFromPayloadWithParamNames(
            payload,
            payloadIn[payloadType]
          )
          break
        case "formData":
          formData = getParametersFromPayloadWithParamNames(
            payload,
            payloadIn[payloadType]
          )
          break
      }
    })
  }

  const headersObject = new Headers({})

  new Headers(headers).forEach((value, key) => {
    headersObject.set(key, String(value))
  })

  const fetchOptions: RequestInit = Object.assign(
    {},
    { method: method, headers: headersObject }
  )

  if (body && typeof body === "string") {
    fetchOptions.body = body
  } else if (body && typeof body === "object" && Object.keys(body).length > 0) {
    fetchOptions.body = JSON.stringify(body)
  } else if (formData && Object.keys(formData).length > 0) {
    fetchOptions.body = Object.keys(formData).reduce((data, key) => {
      data.append(key, formData[key])
      return data
    }, new FormData())
  }

  const callback: request.SuperAgentStatic | request.SuperAgentRequest = [
    "function",
    "object",
  ].includes(typeof options.request)
    ? options.request
    : request

  const handleResponse = (response) => {
    if (typeof options.onResponse === "function")
      return options.onResponse(response)
    return response
  }
  const handleError = (error) => {
    if (typeof options.onError === "function") return options.onError(error)
    throw error
  }

  const fullUrl = [baseUrl, path].join("")
  const agentMethod = method.toLocaleLowerCase()

  switch (agentMethod) {
    case "delete":
    case "get":
      return callback[agentMethod](fullUrl)
        .query(query)
        .then((res) => handleResponse(res))
        .catch((err) => handleError(err))
    default:
      return callback[agentMethod](fullUrl)
        .query(query)
        .send(fetchOptions.body)
        .then((res) => handleResponse(res))
        .catch((err) => handleError(err))
  }
}

export default SuperagentRequestFactory
