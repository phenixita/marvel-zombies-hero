import { Turn } from "./Turn";


export interface Round {
  number: number;
  turns: Turn[];
  startTime: number;
  endTime?: number;
}
