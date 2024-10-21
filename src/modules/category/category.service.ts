import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schema/category.schema';
import { Model } from 'mongoose';
import { Response } from 'express';
import { CreateCategoryDto } from 'src/common/dtos/createCategory.dto';
import { EditCategoryDto } from 'src/common/dtos/editCategory.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private CategoryModel: Model<Category>,
  ) {}

  async findAll(res: Response, currentPage: number, limit: number) {
    try {
      const skip = (currentPage - 1) * limit;
      const [categories, totalCategories] = await Promise.all([
        this.CategoryModel.find().skip(skip).limit(limit),
        this.CategoryModel.countDocuments(),
      ]);
      if (!categories) {
        return res
          .status(HttpStatus.OK)
          .json({ message: 'No Categories', success: false });
      }
      return res.status(HttpStatus.OK).json({
        message: 'List of categories',
        success: true,
        categories: categories,
        totalCategories,
        currentPage,
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to fetch categories',
        error: error.message || 'Unknown error',
      });
    }
  }

  async addCategory(res: Response, categoryData: CreateCategoryDto) {
    try {
      const lowerCaseName = categoryData.name.toLowerCase();

      const isExisting = await this.CategoryModel.findOne({
        name: lowerCaseName,
      }).lean();
      if (isExisting) {
        return res
          .status(HttpStatus.CONFLICT)
          .json({ success: false, message: 'Category name already exists' });
      }

      const newCategory = new this.CategoryModel({
        name: lowerCaseName,
        description: categoryData.description,
      });

      await newCategory.save();

      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'New category created',
        category: newCategory,
      });
    } catch (error) {
      console.error('Error creating category:', error);

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }

  async editCategory(id: string, res: Response, categoryData: EditCategoryDto) {
    try {
      const lowerCaseName = categoryData.name.toLowerCase();
      const category = await this.CategoryModel.findById(id);
      if (!category) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: 'Category not found' });
      }
      const isExistingName = await this.CategoryModel.findOne({
        name: lowerCaseName,
        _id: { $ne: id },
      });
      if (isExistingName) {
        return res
          .status(HttpStatus.CONFLICT)
          .json({ success: false, message: 'Category name already exists' });
      }
      category.name = lowerCaseName;
      category.description = categoryData.description;
      category.isActive = categoryData.status;
      await category.save();
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Category updated successfully',
        category,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }

  async changeStatus(id: string, res: Response, action: boolean) {
    try {
      const category = await this.CategoryModel.findById(id);
      if (!category) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Category not found', success: false });
      }
      if (action === true || action === false) {
        const isActive = action === true;
        category.isActive = isActive;
        await category.save();
        return res.status(HttpStatus.OK).json({
          success: true,
          message: `Status successfully updated to ${isActive ? 'active' : 'inactive'}`,
          warning: isActive ? false : true,
        });
      }
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message:
          'Invalid action, only "true" or "false" are allowed for status update',
      });
    } catch (error) {
      console.error('Error while changing category status:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
}
