import type { HttpMethod } from './http-method.enum.ts';

export type HttpMethodValue = (typeof HttpMethod)[keyof typeof HttpMethod];
