export interface DataInfo {
  name: string;
  type: 'structural' | 'sound' | 'text' | 'vision';
  numRows: number;
  isClean: boolean;
  cleansed: DataBasic|null;
  preprocessed: DataBasic|null;
}

export interface DataBasic {
  name: string;
  numRows: number;
}

export interface AllData {
  name: string;
  type: string;
  numRows: number;
  status: 'clean' | 'cleansed' | 'preprocessed' | 'dirty';
}

export interface EdaData {
  name: string;
  parentId: number;
  numRows: number;
}

export interface TableData {
  data: any[];
}

export interface CompactData {
  data: any[];
  base: number;
}
