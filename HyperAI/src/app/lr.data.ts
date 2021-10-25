export interface LrRequestData {
  isOpen: boolean;
  tableName: string;
  sourceColumn: string;
  targetColumn: string;
  numOfFolds?: string;
}

export interface LrResponseData {
  alpha: number;
  slope: number;
  intercept: number;
}
