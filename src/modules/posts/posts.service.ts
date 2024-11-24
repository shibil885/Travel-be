import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schema/post.schema';
import { Model, Types } from 'mongoose';
import { UploadPostDto } from 'src/common/dtos/uploadPost.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { LikeType } from 'src/common/enum/likeType.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly _PostModel: Model<Post>,
    private readonly _cloudinaryService: CloudinaryService,
  ) {}

  async getUserPosts(userId: string) {
    return await this._PostModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ]);
  }

  async uploadPost(
    userId: string,
    uploadPostData: UploadPostDto,
    image: Express.Multer.File,
  ) {
    if (!uploadPostData) {
      throw new NotFoundException('Post data not provided');
    }

    if (!image) {
      throw new BadRequestException('Image file is required');
    }

    const imageUrl = await this._cloudinaryService
      .uploadFile(image)
      .then((res) => res.url)
      .catch((error) => {
        throw new InternalServerErrorException(
          'Failed to upload image: ' + error.message,
        );
      });

    const newPost = await this._PostModel.create({
      userId: new Types.ObjectId(userId),
      imageUrl,
      caption: uploadPostData.caption,
      visibility: uploadPostData.visibility,
      likes: [],
      comments: [],
    });
    return newPost ? true : false;
  }

  async updateLike(userId: string, postId: string, action: LikeType) {
    if (!postId) {
      throw new NotFoundException('Post id not provided');
    }
    const parsedPostId = new Types.ObjectId(postId);
    const isExisting = await this._PostModel.countDocuments({
      _id: parsedPostId,
    });
    if (!isExisting) {
      throw new NotFoundException('Post not found');
    }
    const updateOperator =
      action === LikeType.LIKE
        ? { $push: { likes: { userId: new Types.ObjectId(userId) } } }
        : { $pull: { likes: { userId: new Types.ObjectId(userId) } } };

    const updateResult = await this._PostModel.updateOne(
      { _id: parsedPostId },
      updateOperator,
    );

    return updateResult.modifiedCount > 0;
  }

  async updateComment(
    userId: string,
    postId: string,
    comment: string,
    action: 'add' | 'remove',
    commentId: string = '',
  ) {
    if (!postId) {
      throw new NotFoundException('Post ID not provided');
    }
    if (!comment) {
      throw new BadRequestException('Comment not provided');
    }

    const parsedPostId = new Types.ObjectId(postId);
    const isExisting = await this._PostModel.countDocuments({
      _id: parsedPostId,
    });
    if (!isExisting) {
      throw new NotFoundException('Post not found');
    }
    const updateOperator =
      action === 'add'
        ? {
            $push: {
              comments: {
                userId: new Types.ObjectId(userId),
                comment,
                created_at: new Date(),
              },
            },
          }
        : {
            $pull: {
              comments: { _id: new Types.ObjectId(commentId) },
            },
          };
    const updateResult = await this._PostModel.updateOne(
      { _id: parsedPostId },
      updateOperator,
    );
    return updateResult.modifiedCount > 0;
  }

  async getAllPost(userId: string) {
    const posts = await this._PostModel
      .find({
        userId: { $ne: userId },
        visibility: 'public',
      })
      .populate('userId')
      .populate({ path: 'comments.userId', select: 'username' });
    return posts;
  }
  // async getAllPost(userId: string) {
  //   const posts = await this._PostModel.aggregate([
  //     { $match: { userId: { $ne: userId }, visibility: 'public' } },
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'userId',
  //         foreignField: '_id',
  //         as: 'user',
  //       },
  //     },
  //     { $unwind: '$user' },
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'comments.userId',
  //         foreignField: '_id',
  //         as: 'comments.user',
  //       },
  //     },
  //     { $unwind: { path: '$comments.user', preserveNullAndEmptyArrays: true } },
  //   ]);

  //   console.log('-------->>', posts);
  //   return posts;
  // }
}
