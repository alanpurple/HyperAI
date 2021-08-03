export interface SummaryData {
  name: string;
  count: number;
  mean: number;
  min: number;
  std: number;
  q1: number;
  q2: number;
  q3: number;
  max: number;
  unique: number;
  top: string;
  frequency: number;
  type: 'categorical' | 'datetime' | 'numeric';
}
