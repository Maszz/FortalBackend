/**
 * helper type declaration for `AuthProcessor`
 */
export enum tokenType {
  accessToken = 'accessToken',
  refreshToken = 'refreshToken',
}
export interface ArgonHashPayload {
  data: string;
  options: {
    hashLength: number;
  };
}

export interface TripleDesDecryptPayload {
  data: string;
  type: tokenType;
}
