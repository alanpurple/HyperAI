export interface SummaryData {
  name: string;
  count: number;
  mean: string;
  min: string;
  std: string;
  q1: string;
  q2: string;
  q3: string;
  max: string;
  unique: number;
  top: string;
  frequency: number;
  type: 'categorical' | 'datetime' | 'numeric';
}
