import { Hero } from "./Hero";
import { Round } from "./Round";
import { Turn } from "./Turn";


export interface GameState {
  heroes: Hero[];
  currentRound?: Round;
  currentTurn?: Turn;
  isAutomaticMode?: boolean;
  gameOver?: boolean;
}
