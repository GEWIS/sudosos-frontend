import { User } from '@/entities/User';

export interface LoginResponse {
  user: User,
  token: string,
  roles: string[]
}
