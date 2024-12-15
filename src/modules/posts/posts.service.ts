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
import sharp from 'sharp';

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
    images: Express.Multer.File[],
  ) {
    if (!uploadPostData) {
      throw new NotFoundException('Post data not provided');
    }

    if (!images || images.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    // Validate maximum number of images
    const MAX_IMAGES = 5;
    if (images.length > MAX_IMAGES) {
      throw new BadRequestException(
        `Maximum ${MAX_IMAGES} images allowed per post`,
      );
    }

    try {
      // Define fixed dimensions for cropping and resizing
      const FIXED_WIDTH = 800; // Example: 800px wide
      const FIXED_HEIGHT = 600; // Example: 600px tall

      // Process and upload images
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          // Resize and crop the image
          const processedImageBuffer = await sharp(image.buffer)
            .resize(FIXED_WIDTH, FIXED_HEIGHT, {
              fit: 'cover', // Ensures cropping
              position: sharp.strategy.entropy, // Focal point cropping
            })
            .toBuffer();

          // Upload to Cloudinary
          const uploadResult = await this._cloudinaryService.uploadFileBuffer(
            processedImageBuffer,
            image.mimetype, // Ensure the correct MIME type is passed
          );

          return uploadResult.url;
        }),
      );

      // Create new post with multiple image URLs
      const newPost = await this._PostModel.create({
        userId: new Types.ObjectId(userId),
        imageUrls, // Store array of image URLs
        imageCount: imageUrls.length, // Track number of images
        caption: uploadPostData.caption,
        visibility: uploadPostData.visibility || 'public',
        likes: [],
        comments: [],
      });

      return newPost ? true : false;
    } catch (error) {
      // More specific error handling
      throw new InternalServerErrorException(
        `Failed to upload post: ${error.message}`,
      );
    }
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
    const updateResult = await this._PostModel
      .updateOne({ _id: parsedPostId }, updateOperator)
      .exec();
    return updateResult;
  }

  async getAllPost(userId: string) {
    const posts = await this._PostModel
      .find({
        userId: { $ne: userId },
        visibility: 'public',
      })
      .populate('userId')
      .populate('comments.userId');
    return posts;
  }
}
