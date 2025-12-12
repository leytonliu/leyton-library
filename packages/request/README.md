# @leyton/request

A powerful, strictly typed HTTP client based on **Axios**, designed for **Web** and **UniApp (WeChat MiniProgram)** environments.

## Features

- 🚀 **Multi-Platform**: Seamlessly works in Browser and UniApp/WeChat MiniProgram.
- 🔒 **Type Safe**: Full TypeScript support with generic response types.
- 🛡️ **Interceptor**: Built-in token injection and error handling.
- ⚡ **Optimization**: Automatic request deduplication and cancellation.
- 📂 **File Upload**: Simplified `upload` method.

## Installation

```bash
pnpm add @leyton/request
```

## Usage

### 1. Basic Setup

Create an instance of `HttpClient`:

```typescript
import HttpClient, { HttpClientConfig } from '@leyton/request';

const config: HttpClientConfig = {
  baseURL: 'https://api.example.com',
  timeout: 10000,
  tokenStorageKey: 'auth_token', // Key in localStorage
  onUnauthorized: () => {
    // Redirect to login page
    console.log('Token expired, please login.');
    window.location.href = '/login';
  },
  onError: (err) => {
    console.error('Global error handler:', err.message);
  }
};

export const client = new HttpClient(config);
```

### 2. Making Requests

```typescript
interface User {
  id: number;
  name: string;
}

// GET Request
async function getUser(id: number) {
  try {
    const user = await client.get<User>(`/users/${id}`);
    console.log(user.name);
  } catch (error) {
    console.error(error);
  }
}

// POST Request
async function createUser(data: { name: string }) {
  const newUser = await client.post<User>('/users', data);
  return newUser;
}
```

### 3. File Upload

```typescript
async function uploadAvatar(file: File) {
  const result = await client.upload<{ url: string }>('/upload', file, 'avatar');
  console.log('Uploaded:', result.url);
}
```

### 4. Cancellation

Requests are automatically cancelled if a duplicate request (same URL, method, params) is initiated while the previous one is pending. You can also manually cancel requests.

```typescript
client.cancelAllRequests();
```

### 5. UniApp / MiniProgram Support

The library automatically detects the environment. If running in UniApp or WeChat MiniProgram, it switches to the internal adapter using `uni.request` or `wx.request`.

No extra configuration is needed!

## API

### `HttpClient`

#### Constructor
`new HttpClient(config: HttpClientConfig)`

#### Methods
- `request<T>(url, config): Promise<T>`
- `get<T>(url, params?, config?): Promise<T>`
- `post<T>(url, data?, config?): Promise<T>`
- `put<T>(url, data?, config?): Promise<T>`
- `delete<T>(url, params?, config?): Promise<T>`
- `patch<T>(url, data?, config?): Promise<T>`
- `upload<T>(url, file, fieldName?, config?): Promise<T>`
- `cancelAllRequests(message?)`

### `HttpClientConfig`

| Property | Type | Description |
|Data | --- | --- |
| `baseURL` | `string` | Base URL for API |
| `timeout` | `number` | Request timeout (ms) |
| `tokenStorageKey` | `string` | LocalStorage key for token |
| `getToken` | `() => string \| Promise<string>` | Custom token retrieval |
| `onUnauthorized` | `() => void` | 401 callback |
| `onError` | `(err: ApiError) => void` | Global error callback |
