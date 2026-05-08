import { getSignedUploadUrl } from '../config/s3.js';
import { setupLogging } from '../utils/logger.js';
import { generateUploadId } from '../utils/crypto.js';

const logger = setupLogging();

export const getSignedUploadURL = async (req, res, next) => {
  try {
    const { fileName, contentType, purpose = 'attendance' } = req.body;

    if (!fileName || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'fileName and contentType are required',
      });
    }

    const uploadId = generateUploadId();

    const { uploadUrl, blobUrl, key } = await getSignedUploadUrl(
      fileName,
      contentType,
      3600 // 1 hour expiry
    );

    logger.info(`Signed upload URL generated for user ${req.user._id}`, {
      uploadId,
      purpose,
    });

    res.json({
      success: true,
      data: {
        uploadId,
        uploadUrl,
        blobUrl,
        s3Key: key,
        expiresIn: 3600,
      },
    });
  } catch (error) {
    logger.error('Signed upload error:', error);
    next(error);
  }
};

export const confirmUpload = async (req, res, next) => {
  try {
    const { uploadId, blobUrl, metadata } = req.body;

    if (!uploadId || !blobUrl) {
      return res.status(400).json({
        success: false,
        message: 'uploadId and blobUrl are required',
      });
    }

    logger.info(`Upload confirmed for ${uploadId}`);

    res.json({
      success: true,
      message: 'Upload confirmed',
      data: {
        uploadId,
        blobUrl,
      },
    });
  } catch (error) {
    logger.error('Upload confirmation error:', error);
    next(error);
  }
};
