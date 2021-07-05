import { Document } from 'mongoose';
import { PlayerInterface } from 'src/interfaces/players/player.interface';

export interface CategoryInterface extends Document {
  readonly category: string;
  description: string;
  events: Array<EventInterface>;
  players: Array<PlayerInterface>;
}

export interface EventInterface {
  name: string;
  operation: string;
  value: number;
}