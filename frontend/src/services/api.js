const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  })

  const contentType = response.headers.get('content-type') || ''

  const data = contentType.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    throw new Error(
      data?.error || 'Something went wrong. Please try again.'
    )
  }

  return data
}

export function assetUrl(path) {
  if (!path) return ''

  // Already an absolute URL
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  // Remove /api from the API base URL
  const baseUrl = API_URL.replace(/\/api$/i, '')

  // Ensure image path starts with /
  const imagePath = path.startsWith('/') ? path : `/${path}`

  return `${baseUrl}${imagePath}`
}
