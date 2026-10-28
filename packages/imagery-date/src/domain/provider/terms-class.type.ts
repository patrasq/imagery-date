import type { TermsClass } from './terms-class.enum.ts';

export type TermsClassValue = (typeof TermsClass)[keyof typeof TermsClass];
