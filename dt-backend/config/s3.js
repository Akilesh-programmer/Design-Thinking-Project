import AWS from 'aws-sdk';

const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION || 'us-east-1',
};

const s3 = new AWS.S3(s3Config);

export const getSignedUploadUrl = async (
  fileName,
  contentType,
  expiresIn = 3600
) => {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `uploads/${Date.now()}-${fileName}`,
    ContentType: contentType,
    Expires: expiresIn,
  };

  try {
    const uploadUrl = s3.getSignedUrl('putObject', params);
    return {
      uploadUrl,
      blobUrl: `s3://${params.Bucket}/${params.Key}`,
      key: params.Key,
    };
  } catch (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

export const deleteObject = async (key) => {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    throw new Error(`Failed to delete object: ${error.message}`);
  }
};

export default s3;
