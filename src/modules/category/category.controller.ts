// import {
//   Body,
//   Controller,
//   Get,
//   Param,
//   Patch,
//   Post,
//   Put,
//   Query,
//   Res,
// } from '@nestjs/common';
// import { CreateCategoryDto } from 'src/common/dtos/createCategory.dto';
// import { CategoryService } from './category.service';
// import { Response } from 'express';
// import { EditCategoryDto } from 'src/common/dtos/editCategory.dto';

// @Controller('category')
// export class CategoryController {
//   constructor(private categoryService: CategoryService) {}
//   @Get('categories')
//   findAll(
//     @Res() res: Response,
//     @Query('currentPage') currentPage: number,
//     @Query('limit') limit: number,
//   ) {
//     return this.categoryService.findAll(res, currentPage, limit);
//   }

//   @Post('add')
//   addCategory(@Res() res: Response, @Body() categoryData: CreateCategoryDto) {
//     return this.categoryService.addCategory(res, categoryData);
//   }

//   @Put('edit/:id')
//   editCategory(
//     @Param() param,
//     @Res() res: Response,
//     @Body() categoryData: EditCategoryDto,
//   ) {
//     return this.categoryService.editCategory(param.id, res, categoryData);
//   }

//   @Patch('changeStatus/:id')
//   changeStatus(@Param() param, @Res() res: Response, @Body() action) {
//     return this.categoryService.changeStatus(param.id, res, action.status);
//   }
// }
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from 'src/common/dtos/createCategory.dto';
import { UpdateCategoryDto } from 'src/common/dtos/updateCategory.dto';
import { UpdateStatusDto } from 'src/common/dtos/updateUserStaus.dto';
import { ApiResponse } from 'src/common/decorators/response.decorator';

@Controller('category')
export class CategoryController {
  constructor(
    @Inject('CategoryService')
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  @ApiResponse('Category list fetched successfully')
  async findAll(@Query() query) {
    const result = await this.categoryService.findAll(
      query.currentPage,
      query.limit,
    );
    return {
      categories: result.categories,
      totalCategories: result.totalCategories,
      currentPage: result.currentPage,
    };
  }

  @Post()
  @ApiResponse('New category created', HttpStatus.CREATED)
  async create(@Body() categoryData: CreateCategoryDto) {
    const result = await this.categoryService.create(categoryData);
    return {
      category: result.category,
    };
  }

  @Put(':id')
  @ApiResponse('Category successfully updated')
  async update(
    @Param('id') id: string,
    @Body() categoryData: UpdateCategoryDto,
  ) {
    const result = await this.categoryService.update(id, categoryData);
    return {
      category: result.category,
    };
  }

  @Patch(':id/status')
  @ApiResponse('Category status changed')
  async updateStatus(
    @Param('id') id: string,
    @Body() statusData: UpdateStatusDto,
  ) {
    const result = await this.categoryService.updateStatus(
      id,
      statusData.status,
    );
    return result;
  }
}
