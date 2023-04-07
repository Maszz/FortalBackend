export interface JwtPayload {
  sub: string;
  // id: string;
  did: string;
  iat: number;
  exp: number;
}
export interface JwtPayloadWithRt extends JwtPayload {
  refreshToken: string;
}
export interface JwtPayloadForSign {
  sub: number;
  username: string;
}
