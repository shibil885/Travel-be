// cloudinary.service.ts

import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary/cloudinary-response';
import * as streamifier from 'streamifier';

@Injectable()
// export class CloudinaryService {
//   uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
//     return new Promise<CloudinaryResponse>((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         (error, result) => {
//           if (error) return reject(error);
//           resolve(result);
//         },
//       );
//       streamifier.createReadStream(file.buffer).pipe(uploadStream);
//     });
//   }
// }
export class CloudinaryService {
  uploadFileBuffer(
    buffer: Buffer,
    mimetype: string,
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          format: this.getFormatFromMimetype(mimetype),
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  private getFormatFromMimetype(mimetype: string): string | undefined {
    switch (mimetype) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      default:
        return undefined;
    }
  }
}
