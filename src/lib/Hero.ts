import { Bystander } from './Bystander';
import { Trait } from './Trait';


export interface Hero {
  id: string;
  name: string;
  health: number;
  hunger: number;
  level: number;
  baseAttackValue: number;
  precision: number;
  traits: Trait[];
  availableActions: number;
  byStander: Bystander | null;
  photo?: string;
}
