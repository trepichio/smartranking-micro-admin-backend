import { Document } from 'mongoose';
import { IPlayer } from 'src/players/interfaces/player.interface';

export interface ICategory extends Document {
  readonly category: string;
  description: string;
  events: Array<IEvent>;
  players: Array<IPlayer>;
}

export interface IEvent {
  name: string;
  operation: string;
  value: number;
}
