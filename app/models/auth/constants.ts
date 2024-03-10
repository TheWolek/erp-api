export interface RegisterAccountData {
  login: string;
  password: string;
  role: string;
}

export interface LoginData {
  login: string;
  password: string;
}

export interface UserLoginData extends LoginData {
  user_id: number;
  role: string;
  change_password: 0 | 1;
}
