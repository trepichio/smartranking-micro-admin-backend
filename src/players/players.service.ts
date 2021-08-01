import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlayerInterface } from './interfaces/player.interface';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel('Player') private readonly playerModel: Model<PlayerInterface>,
  ) {}

  private readonly logger = new Logger(PlayersService.name);

  async createPlayer(dto: PlayerInterface): Promise<PlayerInterface> {
    try {
      const { email } = dto;

      const playerFound = await this.playerModel.findOne({ email }).exec();

      if (playerFound) {
        throw new Error(
          '_E404: This player cannot be created because it does already exist.',
        );
      }
      return await this.create(dto);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async updatePlayer(
    id: string,
    dto: PlayerInterface,
  ): Promise<PlayerInterface> {
    try {
      const playerFound = await this.playerModel.findById(id).exec();

      if (!playerFound) {
        throw new Error(
          '_E404: This player cannot be updated because it has not be found.',
        );
      }
      return await this.update(playerFound.id, dto);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getAllPlayers(): Promise<PlayerInterface[]> {
    try {
      return await this.listPlayers();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getPlayer(email: string): Promise<PlayerInterface> {
    try {
      return await this.findOne({ email });
    } catch (err) {
      this.logger.error(`error: ${JSON.stringify(err.message)}`);
      throw new RpcException(err.message);
    }
  }

  async getPlayerById(id: string): Promise<PlayerInterface> {
    try {
      return await this.findOneById(id);
    } catch (err) {
      this.logger.error(`error: ${JSON.stringify(err.message)}`);
      throw new RpcException(err.message);
    }
  }

  async deletePlayer(id: string): Promise<void> {
    try {
      await this.deleteOne({ id });
    } catch (error) {
      this.logger.error(error);
      throw new RpcException(`Could not delete player with id ${id}.`);
    }
  }

  private async create(dto: PlayerInterface): Promise<PlayerInterface> {
    const createdPlayer = new this.playerModel(dto);

    return await createdPlayer.save();
  }

  private async update(
    id: string,
    dto: PlayerInterface,
  ): Promise<PlayerInterface> {
    return await this.playerModel.findByIdAndUpdate(id, { $set: dto }).exec();
  }

  private async listPlayers(): Promise<PlayerInterface[]> {
    return await this.playerModel.find().populate('category').exec();
  }

  private async findOne(query): Promise<PlayerInterface> {
    const player = await this.playerModel
      .findOne({ email: query.email })
      .exec();

    if (!player) {
      throw new Error(`_E404: Player with email ${query.email} not found`);
    }

    this.logger.log(`player: ${JSON.stringify(player)}`);
    return player;
  }

  private async findOneById(id): Promise<PlayerInterface> {
    const player = await await this.playerModel
      .findById(id)
      .populate('category')
      .exec();

    if (!player) {
      throw new Error(`_E404: Player with id ${id} not found`);
    }

    this.logger.log(`player: ${JSON.stringify(player)}`);
    return player;
  }

  private async deleteOne(query): Promise<PlayerInterface> {
    const { id } = query;

    const deletedPlayer = await this.playerModel.findByIdAndDelete(id).exec();
    if (!deletedPlayer) {
      throw new Error(`_E404: Player with id ${id} does not exist`);
    }
    this.logger.log(`deleted player with id: ${JSON.stringify(id)}`);
    return deletedPlayer;
  }
}
