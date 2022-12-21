export type Auth = {
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

export type Deps = { infrastructure: Services['infrastructure'] };
export function init(deps: Deps): Promise<Auth>;