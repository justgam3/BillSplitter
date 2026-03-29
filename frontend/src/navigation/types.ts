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

export type MainTabParamList = {
  Buddies: undefined;
  Groups: undefined;
  Activities: undefined;
  Profile: undefined;
};

export type AppModalParamList = {
  MainTabs: undefined;
  AddExpense: undefined;
};
