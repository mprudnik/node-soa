import type { Infra } from '../../infra/types';

interface Auth {
  signUp(params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ userId: string; token: string; }>;
  signIn(params: {
    email: string;
    password: string;
  }): Promise<{ userId: string; token: string; }>;
  signOut(params: { token: string; }): Promise<void>;
  refresh(params: { token: string; }): Promise<{ token: string }>;
}

export function init(infra: Infra): Promise<Auth>;
