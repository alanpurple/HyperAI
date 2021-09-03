export class UserData {
  email: string = '';
  emailVerified?: boolean = false;
  nickName?: string = '';
  name: string = '';
  accountType: 'admin' | 'user' = 'user';
  data: string[] = [];
  cleanData: string[] = [];
  cleansedData: string[] = [];
  preprocessedData: string[] = [];
}
