import { Power } from "./Power";


export interface Hero {
  id: string;
  name: string;
  health: number;
  hunger: number;
  level: number;
  baseAttackValue: number;
  precision: number;
  powers: Power[];
  availableActions: number;
}
