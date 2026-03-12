const Post = require('../models/Post.model');
const { emitToAll } = require('../utils/socket');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryService');

exports.createPost = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'User not authenticated'
      });
    }

    // Validate post content
    if (!req.body.content || req.body.content.trim() === '') {
      return res.status(400).json({
        message: 'Post content is required',
        error: 'content field cannot be empty'
      });
    }

    const postData = { 
      author: req.user.id,
      content: req.body.content.trim(),
      category: req.body.category || 'Discussion'
    };

    const uploadedImages = [];
    
    // Handle image uploads to Cloudinary
    if (req.files && req.files.length > 0) {
      console.log(`📸 Processing ${req.files.length} image(s) for post...`);
      
      for (const file of req.files) {
        try {
          console.log(`📤 Uploading ${file.originalname} (${file.size} bytes) to Cloudinary...`);
          
          // Upload to Cloudinary with 'posts' folder
          const cloudinaryResult = await uploadToCloudinary(
            file.buffer,
            'posts'
          );
          
          uploadedImages.push({
            url: cloudinaryResult.url,
            publicId: cloudinaryResult.public_id
          });
          
          console.log(`✅ Image uploaded to Cloudinary: ${cloudinaryResult.public_id}`);
        } catch (uploadErr) {
          console.error(`❌ Error uploading image to Cloudinary:`, uploadErr);
          
          // Delete previously uploaded images if one fails
          if (uploadedImages.length > 0) {
            console.log(`🗑️ Cleaning up ${uploadedImages.length} previously uploaded images...`);
            for (const img of uploadedImages) {
              try {
                await deleteFromCloudinary(img.publicId);
                console.log(`✅ Deleted: ${img.publicId}`);
              } catch (delErr) {
                console.error(`❌ Error deleting image ${img.publicId}:`, delErr);
              }
            }
          }
          
          return res.status(400).json({
            message: 'Failed to upload image to Cloudinary',
            error: uploadErr.message || uploadErr.error || 'Unknown upload error',
            details: uploadErr
          });
        }
      }
      
      postData.images = uploadedImages;
    }
    
    // Save post to MongoDB
    console.log('💾 Saving post to MongoDB...');
    const post = new Post(postData);
    await post.save();
    
    // Populate author info for response
    await post.populate('author', 'name email');
    
    console.log(`✅ Post created successfully with ${uploadedImages.length} images`);
    
    // Emit real-time update
    emitToAll('newPost', post);
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: post
    });
  } catch (error) {
    console.error('❌ Error creating post:', error);
    res.status(500).json({ 
      message: 'Server error while creating post',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const posts = await Post.find(filter)
      .populate('author', 'name email')
      .sort('-createdAt');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email')
      .populate('comments.user', 'name');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const index = post.likes.indexOf(req.user.id);
    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    
    // Emit real-time update
    emitToAll('postLiked', { postId: post._id, likes: post.likes });
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    post.comments.push({ 
      user: req.user.id, 
      text: text,
      createdAt: new Date()
    });
    await post.save();
    
    // Populate the new comment's user info
    await post.populate('comments.user', 'name email');
    
    // Emit real-time update
    emitToAll('postCommented', { postId: post._id, comments: post.comments });
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check authorization - only author can delete
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    // Delete images from Cloudinary
    if (post.images && post.images.length > 0) {
      console.log(`🗑️ Deleting ${post.images.length} image(s) from Cloudinary...`);
      
      for (const image of post.images) {
        try {
          await deleteFromCloudinary(image.publicId);
          console.log(`✅ Deleted image: ${image.publicId}`);
        } catch (delErr) {
          console.error(`❌ Error deleting image ${image.publicId}:`, delErr);
        }
      }
    }
    
    // Delete post from MongoDB
    await Post.findByIdAndDelete(req.params.id);
    
    console.log('✅ Post deleted successfully');
    
    // Emit real-time update
    emitToAll('postDeleted', { postId: req.params.id });
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { content, category } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check authorization - only author can update
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    // Update post content and category
    if (content) post.content = content;
    if (category) post.category = category;
    
    // Handle image updates if new images are provided
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      console.log(`📸 Processing ${req.files.length} new image(s) for post update...`);
      
      // Delete old images from Cloudinary
      if (post.images && post.images.length > 0) {
        for (const image of post.images) {
          try {
            await deleteFromCloudinary(image.publicId);
            console.log(`✅ Deleted old image: ${image.publicId}`);
          } catch (delErr) {
            console.error(`❌ Error deleting old image:`, delErr);
          }
        }
      }
      
      // Upload new images
      for (const file of req.files) {
        try {
          const cloudinaryResult = await uploadToCloudinary(
            file.buffer,
            'posts'
          );
          
          uploadedImages.push({
            url: cloudinaryResult.url,
            publicId: cloudinaryResult.public_id
          });
          
          console.log(`✅ New image uploaded: ${cloudinaryResult.public_id}`);
        } catch (uploadErr) {
          console.error(`❌ Error uploading new image:`, uploadErr);
          
          // Delete newly uploaded images if one fails
          for (const img of uploadedImages) {
            try {
              await deleteFromCloudinary(img.publicId);
            } catch (delErr) {
              console.error(`Error deleting image:`, delErr);
            }
          }
          
          return res.status(400).json({
            message: 'Failed to upload image to Cloudinary',
            error: uploadErr.message || uploadErr.error
          });
        }
      }
      
      post.images = uploadedImages;
    }
    
    await post.save();
    await post.populate('author', 'name email');
    
    console.log('✅ Post updated successfully');
    
    // Emit real-time update
    emitToAll('postUpdated', post);
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      post: post
    });
  } catch (error) {
    console.error('❌ Error updating post:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};