import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CategoryInterface } from './interfaces/categories/category.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private readonly logger = new Logger(AppController.name);

  @EventPattern('create-category')
  async createCategory(@Payload() category: CategoryInterface) {
    this.logger.log(`Category: ${JSON.stringify(category)}`);

    await this.appService.createCategory(category);
  }
  }
}
