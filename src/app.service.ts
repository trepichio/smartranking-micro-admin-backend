import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryInterface } from './interfaces/categories/category.interface';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('Category')
    private readonly categoryModel: Model<CategoryInterface>,
  ) {}

  private readonly logger = new Logger(AppService.name);

  async createCategory(dto: CategoryInterface): Promise<CategoryInterface> {
    try {
      const categoryCreated = new this.categoryModel(dto);
      return await categoryCreated.save();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
