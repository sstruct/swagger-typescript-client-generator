export interface ApiResponse<T> extends Response {
  json(): Promise<T>
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
  path: string
  query?: any
  body?: any
  formData?: any
  headers?: any
  method: string
  configuration: any
}) => Promise<ApiResponse<any>>
