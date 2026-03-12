const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary from buffer or file path
 * @param {Buffer | string} source - Image buffer or file path
 * @param {string} folder - Cloudinary folder path
 * @param {string} public_id - Public ID for the image (optional, auto-generated if not provided)
 * @returns {Promise<Object>} Cloudinary response with url and public_id
 */
const uploadToCloudinary = async (source, folder = 'cotton-disease-detection', public_id = null) => {
  try {
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      width: 1024,
      crop: 'limit',
      tags: ['cotton-disease-detection'],
      timeout: 60000,  // 60 second timeout for upload
      chunk_size: 6000000  // 6MB chunks for large files
    };

    if (public_id) {
      uploadOptions.public_id = public_id;
    }

    let result;

    // Handle both file paths and buffers
    if (typeof source === 'string') {
      console.log(`📤 Uploading file from path: ${source}`);
      result = await cloudinary.uploader.upload(source, uploadOptions);
    } else {
      // For buffer uploads - add timeout handling
      return new Promise((resolve, reject) => {
        console.log(`📤 Uploading buffer (${source.length} bytes) to Cloudinary...`);
        
        const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) {
            console.error('❌ Upload stream error:', error);
            reject(error);
          } else {
            console.log('✅ Upload stream completed successfully');
            resolve(result);
          }
        });

        // Add error handler to stream
        uploadStream.on('error', (err) => {
          console.error('❌ Stream error:', err);
          reject(err);
        });

        // Set timeout on the stream
        const timeout = setTimeout(() => {
          uploadStream.destroy();
          reject(new Error('Upload timeout - stream took too long'));
        }, 60000);

        // Clear timeout if stream completes
        uploadStream.on('finish', () => {
          clearTimeout(timeout);
        });
        
        uploadStream.end(source);
      });
    }

    console.log('✅ Upload completed successfully');
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      size: result.bytes,
      format: result.format
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message);
    console.error('Error details:', {
      code: error.code,
      status: error.http_code,
      message: error.message
    });
    throw {
      success: false,
      message: 'Failed to upload image to Cloudinary',
      error: error.message,
      code: error.code || 'UPLOAD_ERROR'
    };
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} public_id - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result === 'ok') {
      return {
        success: true,
        message: 'Image deleted successfully'
      };
    } else {
      throw new Error(`Failed to delete image: ${result.result}`);
    }
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw {
      success: false,
      message: 'Failed to delete image from Cloudinary',
      error: error.message
    };
  }
};

/**
 * Get image URL from public ID
 * @param {string} public_id - Cloudinary public ID
 * @returns {string} Cloudinary URL
 */
const getImageUrl = (public_id) => {
  return cloudinary.url(public_id, {
    quality: 'auto',
    fetch_format: 'auto',
    width: 1024,
    crop: 'limit'
  });
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  getImageUrl,
  cloudinary
};
