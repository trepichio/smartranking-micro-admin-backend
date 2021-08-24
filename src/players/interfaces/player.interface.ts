import { Document } from 'mongoose';

export interface IPlayer extends Document {
  readonly mobileNumber: string;
  readonly email: string;
  name: string;
  ranking: string;
  rankingPosition: number;
  urlProfilePicture: string;
  category: string;
}
