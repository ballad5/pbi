export enum ErrorDefine {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND_ERROR = 404,
  INTERNAL_SERVER_ERROR = 500
}

export class ApiError extends Error {
  code: number
  message: string

  constructor (errorDefine: ErrorDefine) {
    let message = ErrorDefine[errorDefine] || ''
    super(message)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }

    this.message = message
    if (!this.message) {
      this.code = 500
      this.message = 'Unknwon Error'
    } else {
      this.code = errorDefine
    }
  }
}