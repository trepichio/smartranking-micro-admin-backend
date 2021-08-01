import {
  Controller,
  Delete,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { PlayerInterface } from 'src/players/interfaces/player.interface';
import { PlayersService } from './players.service';

const ackErrors: string[] = ['E1100', '_E404'];

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  private readonly logger = new Logger(PlayersController.name);

  @EventPattern('create-player')
  async createPlayer(
    @Payload() player: PlayerInterface,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`createPlayer ${JSON.stringify(player.name)}`);

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.playersService.createPlayer(player);
      await channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(error.message);

      if (ackErrors.some((err) => error.message.includes(err))) {
        await channel.ack(originalMessage);
      }
    }
  }

  @EventPattern('update-player')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updatePlayer(
    @Payload() { id, dto }: { id: string; dto: PlayerInterface },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`updatePlayer ${JSON.stringify(id)}`);
    this.logger.log(`with data:${JSON.stringify(dto)}`);

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.playersService.updatePlayer(id, dto);
      await channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(error.message);

      if (ackErrors.some((err) => error.message.includes(err))) {
        await channel.ack(originalMessage);
      }
    }
  }

  @MessagePattern('get-players')
  async getPlayers(@Payload() _id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      if (!_id) {
        this.logger.log('get all Players');
        return await this.playersService.getAllPlayers();
      } else {
        this.logger.log(`get Players by id ${_id}`);
        return await this.playersService.getPlayerById(_id);
      }
    } finally {
      await channel.ack(originalMessage);
    }
  }

  @EventPattern('delete-player')
  @Delete(':id')
  async deletePlayer(
    @Payload() { id }: { id: string },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Delete Player with id ${JSON.stringify(id)}`);

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.playersService.deletePlayer(id);
      await channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(error.message);

      if (ackErrors.some((err) => error.message.includes(err))) {
        await channel.ack(originalMessage);
      }
    }
  }
}
