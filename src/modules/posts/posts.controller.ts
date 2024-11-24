import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadPostDto } from 'src/common/dtos/uploadPost.dto';
import { Request, Response } from 'express';
import { LikeType } from 'src/common/enum/likeType.enum';

@Controller('posts')
export class PostsController {
  constructor(private readonly _postService: PostsService) {}

  @Get()
  async getAllPosts(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this._postService.getAllPost(req['user']['sub']);
      console.log('-->', result);
      if (result) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'List of posts',
          posts: result,
          userId: req['user']['sub'],
        });
      }
    } catch (error) {
      console.log('error occured while fetch posts', error);
      return res.status(HttpStatus.OK).json({
        success: false,
        message: error.message,
        posts: [],
        userId: req['user']['sub'],
      });
    }
  }

  @Get('user')
  async getUserPosts(@Req() req: Request, @Res() res: Response) {
    try {
      const response = await this._postService.getUserPosts(req['user']['sub']);
      if (response) {
        console.log('hh', response);
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'List of posts', posts: response });
      }
    } catch (error) {
      console.log('Error occured while fetch user post', error);
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadPost(
    @Req() req: Request,
    @Res() res: Response,
    @Body() postData: UploadPostDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    try {
      const response = await this._postService.uploadPost(
        req['user']['sub'],
        postData,
        image,
      );
      if (response) {
        return res
          .status(HttpStatus.CREATED)
          .json({ success: true, message: 'New post uploaded' });
      }
    } catch (error) {
      console.log('error occured while upload post', error);
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.message });
      } else if (error instanceof BadRequestException) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Patch('like/:id')
  async addLike(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') postId: string,
  ) {
    try {
      const response = await this._postService.updateLike(
        req['user']['sub'],
        postId,
        LikeType.LIKE,
      );
      if (response) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Like added' });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Patch('unlike/:id')
  async removeLike(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') postId: string,
  ) {
    try {
      const response = await this._postService.updateLike(
        req['user']['sub'],
        postId,
        LikeType.UNLIKE,
      );
      if (response) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Like removed' });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Patch('addComment/:id')
  async addComment(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') postId: string,
    @Body('comment') comment: string,
  ) {
    try {
      const response = await this._postService.updateComment(
        req['user']['sub'],
        postId,
        comment,
        'add',
      );
      if (response) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Comment added' });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Patch('removeComment/:id/:commentId')
  async removeComment(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') postId: string,
    @Param('commentId') commentId: string,
    @Body() comment: string,
  ) {
    try {
      const response = await this._postService.updateComment(
        req['user']['sub'],
        postId,
        comment,
        'remove',
        commentId,
      );
      if (response) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Comment removed' });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }
}
