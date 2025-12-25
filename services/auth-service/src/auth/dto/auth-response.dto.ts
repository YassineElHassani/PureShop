export class AuthResponseDto {
  access_token: string;
  expires_in: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}