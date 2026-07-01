'use client'

import axios, { AxiosError } from 'axios'
import { config } from '@/lib/config'
import { supabase } from '@/lib/supabase'

export type ApiError = {
  status?: number
  message: string
  details?: unknown
}

const statusMessages: Record<number, string> = {
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested item could not be found.',
  422: 'Some information is missing or invalid.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'The server ran into a problem. Please try again.',
  502: 'The service is temporarily unavailable. Please try again.',
}

export const api = axios.create({
  baseURL: `${config.backendUrl.replace(/\/$/, '')}/api/v1`,
  timeout: 30000,
})

api.interceptors.request.use(async (request) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }

  return request
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const status = error.response?.status

    if (status === 401) {
      await supabase.auth.refreshSession().catch(() => undefined)
    }

    const apiError: ApiError = {
      status,
      message:
        (status && statusMessages[status]) ||
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Something went wrong.',
      details: error.response?.data,
    }

    return Promise.reject(apiError)
  }
)

export function getApiErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as ApiError).message)
  }
  return 'Something went wrong.'
}
