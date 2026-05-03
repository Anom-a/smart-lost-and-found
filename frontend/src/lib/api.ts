import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'

export const API_URL = import.meta.env.VITE_API_URL ?? '/api'
export const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? '/storage'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')

      if (window.location.pathname !== '/login') {
        toast.error('Your session expired. Please sign in again.')
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}