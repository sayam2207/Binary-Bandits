const { db, admin } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class Tuning {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.user = data.user;
    this.car = data.car;
    this.name = data.name;
    this.description = data.description || '';
    this.isPublic = data.isPublic || false;
    this.isTemplate = data.isTemplate || false;
    this.customizations = data.customizations || {};
    this.performanceStats = data.performanceStats || {};
    this.images = data.images || [];
    this.tags = data.tags || [];
    this.likes = data.likes || [];
    this.comments = data.comments || [];
    this.shares = data.shares || [];
    this.views = data.views || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Create a new tuning
  static async create(tuningData) {
    try {
      const tuning = new Tuning(tuningData);
      const tuningRef = db.collection('tunings').doc(tuning.id);
      
      await tuningRef.set({
        ...tuning,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return tuning;
    } catch (error) {
      throw new Error(`Failed to create tuning: ${error.message}`);
    }
  }

  // Get tuning by ID
  static async findById(id) {
    try {
      const tuningDoc = await db.collection('tunings').doc(id).get();
      
      if (!tuningDoc.exists) {
        return null;
      }
      
      const tuningData = tuningDoc.data();
      if (!tuningData.isActive) {
        return null;
      }
      
      return new Tuning({ id: tuningDoc.id, ...tuningData });
    } catch (error) {
      throw new Error(`Failed to find tuning: ${error.message}`);
    }
  }

  // Search tunings with filters
  static async search(options = {}) {
    try {
      const {
        query = '',
        user = null,
        car = null,
        tags = [],
        isPublic = true,
        isTemplate = false,
        limit = 20,
        offset = 0,
        sortBy = 'createdAt',
        sortDirection = 'desc'
      } = options;

      let tuningsQuery = db.collection('tunings')
        .where('isActive', '==', true)
        .where('isPublic', '==', isPublic)
        .where('isTemplate', '==', isTemplate);

      // Apply filters
      if (user) {
        tuningsQuery = tuningsQuery.where('user', '==', user);
      }
      
      if (car) {
        tuningsQuery = tuningsQuery.where('car', '==', car);
      }

      // Order and limit
      tuningsQuery = tuningsQuery
        .orderBy(sortBy, sortDirection)
        .limit(limit)
        .offset(offset);

      const snapshot = await tuningsQuery.get();
      let tunings = snapshot.docs.map(doc => 
        new Tuning({ id: doc.id, ...doc.data() })
      );

      // Apply text search
      if (query) {
        const searchTerm = query.toLowerCase();
        tunings = tunings.filter(tuning => 
          tuning.name.toLowerCase().includes(searchTerm) ||
          tuning.description.toLowerCase().includes(searchTerm) ||
          tuning.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Apply tags filter
      if (tags.length > 0) {
        tunings = tunings.filter(tuning => 
          tags.some(tag => tuning.tags.includes(tag.toLowerCase()))
        );
      }

      return tunings;
    } catch (error) {
      throw new Error(`Failed to search tunings: ${error.message}`);
    }
  }

  // Get featured tunings
  static async getFeatured(limit = 10) {
    try {
      const snapshot = await db.collection('tunings')
        .where('isActive', '==', true)
        .where('isPublic', '==', true)
        .where('isTemplate', '==', false)
        .orderBy('views', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => 
        new Tuning({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error(`Failed to get featured tunings: ${error.message}`);
    }
  }

  // Get tuning templates
  static async getTemplates(limit = 20) {
    try {
      const snapshot = await db.collection('tunings')
        .where('isActive', '==', true)
        .where('isPublic', '==', true)
        .where('isTemplate', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => 
        new Tuning({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error(`Failed to get templates: ${error.message}`);
    }
  }

  // Update tuning
  async update(updateData) {
    try {
      const tuningRef = db.collection('tunings').doc(this.id);
      
      await tuningRef.update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update local instance
      Object.assign(this, updateData);
      this.updatedAt = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to update tuning: ${error.message}`);
    }
  }

  // Delete tuning (soft delete)
  async delete() {
    try {
      const tuningRef = db.collection('tunings').doc(this.id);
      
      await tuningRef.update({
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      this.isActive = false;
      this.updatedAt = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to delete tuning: ${error.message}`);
    }
  }

  // Add like
  async addLike(userId) {
    try {
      const existingLike = this.likes.find(like => like.user === userId);
      if (existingLike) {
        return this; // Already liked
      }

      const tuningRef = db.collection('tunings').doc(this.id);
      
      await tuningRef.update({
        likes: admin.firestore.FieldValue.arrayUnion({
          user: userId,
          likedAt: new Date()
        }),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      this.likes.push({ user: userId, likedAt: new Date() });
      this.updatedAt = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to add like: ${error.message}`);
    }
  }

  // Remove like
  async removeLike(userId) {
    try {
      const likeToRemove = this.likes.find(like => like.user === userId);
      if (!likeToRemove) {
        return this; // Not liked
      }

      const tuningRef = db.collection('tunings').doc(this.id);
      
      await tuningRef.update({
        likes: admin.firestore.FieldValue.arrayRemove(likeToRemove),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      this.likes = this.likes.filter(like => like.user !== userId);
      this.updatedAt = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to remove like: ${error.message}`);
    }
  }

  // Add comment
  async addComment(userId, text) {
    try {
      const comment = {
        id: uuidv4(),
        user: userId,
        text: text,
        createdAt: new Date(),
        isEdited: false
      };

      const tuningRef = db.collection('tunings').doc(this.id);
      
      await tuningRef.update({
        comments: admin.firestore.FieldValue.arrayUnion(comment),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      this.comments.push(comment);
      this.updatedAt = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  // Increment views
  async incrementViews() {
    try {
      const tuningRef = db.collection('tunings').doc(this.id);
      
      await tuningRef.update({
        views: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      this.views += 1;
      this.updatedAt = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to increment views: ${error.message}`);
    }
  }

  // Add share
  async addShare(userId, platform = 'other') {
    try {
      const share = {
        user: userId,
        platform: platform,
        sharedAt: new Date()
      };

      const tuningRef = db.collection('tunings').doc(this.id);
      
      await tuningRef.update({
        shares: admin.firestore.FieldValue.arrayUnion(share),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      this.shares.push(share);
      this.updatedAt = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to add share: ${error.message}`);
    }
  }

  // Get similar tunings
  async getSimilar(limit = 6) {
    try {
      const snapshot = await db.collection('tunings')
        .where('isActive', '==', true)
        .where('isPublic', '==', true)
        .where('car', '==', this.car)
        .limit(limit + 1)
        .get();

      const similarTunings = snapshot.docs
        .map(doc => new Tuning({ id: doc.id, ...doc.data() }))
        .filter(tuning => tuning.id !== this.id)
        .slice(0, limit);

      return similarTunings;
    } catch (error) {
      throw new Error(`Failed to get similar tunings: ${error.message}`);
    }
  }

  // Get primary image
  getPrimaryImage() {
    const primaryImage = this.images.find(img => img.isPrimary);
    return primaryImage || this.images[0] || null;
  }

  // Get like count
  get likeCount() {
    return this.likes.length;
  }

  // Get comment count
  get commentCount() {
    return this.comments.length;
  }

  // Get share count
  get shareCount() {
    return this.shares.length;
  }

  // Convert to JSON
  toJSON() {
    return { ...this };
  }
}

module.exports = Tuning;
