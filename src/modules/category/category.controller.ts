import { Body, Controller, Get, Param, Post, Put, Res } from '@nestjs/common';
import { CreateCategoryDto } from 'src/common/dtos/createCategory.dto';
import { CategoryService } from './category.service';
import { Response } from 'express';
import { EditCategoryDto } from 'src/common/dtos/editCategory.dto';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}
  @Get('categories')
  findAll(@Res() res: Response) {
    return this.categoryService.findAll(res);
  }

  @Post('add')
  addCategory(@Res() res: Response, @Body() categoryData: CreateCategoryDto) {
    return this.categoryService.addCategory(res, categoryData);
  }

  @Put('edit/:id')
  editCategory(
    @Param() param,
    @Res() res: Response,
    @Body() categoryData: EditCategoryDto,
  ) {
    return this.categoryService.editCategory(param.id, res, categoryData);
  }

  @Post('changeStatus/:id')
  changeStatus(@Param() param, @Res() res: Response, @Body() action) {
    return this.categoryService.changeStatus(param.id, res, action.action);
  }
}
