export class DataInfo {
  name: string = '';
  type: 'structural' | 'sound' | 'text' | 'image' = 'structural';
  numRows: number = 0;
}

export interface AllData {
  name: string;
  type: string;
  numRows: number;
  isClean: boolean;
}
