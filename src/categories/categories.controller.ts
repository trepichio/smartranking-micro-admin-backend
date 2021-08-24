import { Controller, Get, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CategoriesService } from './categories.service';
import { CategoryInterface } from './interfaces/category.interface';

const ackErrors: string[] = ['E11000'];

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  private readonly logger = new Logger(CategoriesController.name);

  @EventPattern('create-category')
  async createCategory(
    @Payload() category: CategoryInterface,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Category: ${JSON.stringify(category, null, 2)}`);

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.categoriesService.createCategory(category);
      await channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(error.message);

      if (ackErrors.some((err) => error.message.includes(err))) {
        await channel.ack(originalMessage);
      }
    }
  }

  @MessagePattern('get-categories')
  async getCategories(@Payload() _id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      if (!_id) {
        this.logger.log('get all categories');
        return await this.categoriesService.getAllCategories();
      } else {
        this.logger.log(`Get categories for _id: ${_id}`);
        return await this.categoriesService.getCategoryById(_id);
      }
    } finally {
      channel.ack(originalMessage);
    }
  }

  @EventPattern('update-category')
  async updateCategory(
    @Payload() { id, dto }: { id: string; dto: CategoryInterface },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Update Category: ${JSON.stringify(dto, null, 2)}`);

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.categoriesService.updateCategory(dto, id);
      await channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(error.message);

      if (ackErrors.some((err) => error.message.includes(err))) {
        await channel.ack(originalMessage);
      }
    }
  }

  @EventPattern('delete-category')
  async deleteCategory(
    @Payload() { id }: { id: string },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Delete Category: ${id}`);

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.categoriesService.deleteCategory(id);
      await channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(error.message);

      if (ackErrors.some((err) => error.message.includes(err))) {
        await channel.ack(originalMessage);
      }
    }
  }
}
