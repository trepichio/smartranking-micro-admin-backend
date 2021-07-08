import { Controller, Get, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { AppService } from './app.service';
import { CategoryInterface } from './interfaces/categories/category.interface';

const ackErrors: string[] = ['E11000'];

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private readonly logger = new Logger(AppController.name);

  @EventPattern('create-category')
  async createCategory(
    @Payload() category: CategoryInterface,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Category: ${JSON.stringify(category)}`);

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.appService.createCategory(category);
      await channel.ack(originalMessage);
    } catch (error) {
      ackErrors.map(async (err) => (error.message.includes(err) && (await channel.ack(originalMessage))))
    }
  }

  @MessagePattern('get-categories')
  async getCategories(@Payload() _id: string) {
    if (!_id) {
      return await this.appService.getAllCategories();
    } else {
      return await this.appService.getCategoryById(_id);
    }
  }
}
