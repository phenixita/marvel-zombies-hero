import { TurnPhase } from "./TurnPhase";


export interface Turn {
  heroId: string;
  startTime: number;
  phase: TurnPhase;
  actionsTaken: number;
}
