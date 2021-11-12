import { DataInfo } from './data.info';

export class UserData {
  email: string = '';
  emailVerified?: boolean = false;
  nickName?: string = '';
  name: string = '';
  organization: string | undefined = undefined;
  accountType: 'admin' | 'user' = 'user';
  data: DataInfo[] = [];
}
