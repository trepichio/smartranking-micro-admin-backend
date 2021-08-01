import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryInterface } from './interfaces/category.interface';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category')
    private readonly categoryModel: Model<CategoryInterface>,
  ) {}

  private readonly logger = new Logger(CategoriesService.name);

  async createCategory(dto: CategoryInterface): Promise<CategoryInterface> {
    try {
      const categoryCreated = new this.categoryModel(dto);
      return await categoryCreated.save();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getAllCategories() {
    try {
      return await this.categoryModel.find().exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getCategoryById(_id: string) {
    try {
      return await this.categoryModel.findOne({ _id }).exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async updateCategory(
    dto: CategoryInterface,
    _id: string,
  ): Promise<CategoryInterface> {
    try {
      const categoryUpdated = await this.categoryModel
        .findOneAndUpdate({ _id }, dto)
        .exec();
      return categoryUpdated;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async deleteCategory(_id: string): Promise<void> {
    try {
      await this.categoryModel.findOneAndRemove({ _id }).exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}