export type AuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
  EmailVerification: {
    email: string;
  };
};

export type AppStackParamList = {
  Main: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;
