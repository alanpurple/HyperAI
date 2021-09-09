import { DataInfo } from './data.info';

export class UserData {
  email: string = '';
  emailVerified?: boolean = false;
  nickName?: string = '';
  name: string = '';
  accountType: 'admin' | 'user' = 'user';
  data: DataInfo[] = [];
}
