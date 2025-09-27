const { db, admin } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class Project {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.user = data.user;
    this.name = data.name;
    this.description = data.description || '';
    this.tunings = data.tunings || [];
    this.isPublic = data.isPublic || false;
    this.isTemplate = data.isTemplate || false;
    this.tags = data.tags || [];
    this.images = data.images || [];
    this.likes = data.likes || [];
    this.views = data.views || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Create a new project
  static async create(projectData) {
    try {
      const project = new Project(projectData);
      const projectRef = db.collection('projects').doc(project.id);
      
      await projectRef.set({
        ...project,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return project;
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  // Get project by ID
  static async findById(id) {
    try {
      const projectDoc = await db.collection('projects').doc(id).get();
      
      if (!projectDoc.exists) {
        return null;
      }
      
      const projectData = projectDoc.data();
      if (!projectData.isActive) {
        return null;
      }
      
      return new Project({ id: projectDoc.id, ...projectData });
    } catch (error) {
      throw new Error(`Failed to find project: ${error.message}`);
    }
  }

  // Search projects with filters
  static async search(options = {}) {
    try {
      const {
        query = '',
        user = null,
        tags = [],
        isPublic = true,
        isTemplate = false,
        limit = 20,
        offset = 0,
        sortBy = 'createdAt',
        sortDirection = 'desc'
      } = options;

      let projectsQuery = db.collection('projects')
        .where('isActive', '==', true)
        .where('isPublic', '==', isPublic)
        .where('isTemplate', '==', isTemplate);

      // Apply filters
      if (user) {
        projectsQuery = projectsQuery.where('user', '==', user);
      }

      // Order and limit
      projectsQuery = projectsQuery
        .orderBy(sortBy, sortDirection)
        .limit(limit)
        .offset(offset);

      const snapshot = await projectsQuery.get();
      let projects = snapshot.docs.map(doc => 
        new Project({ id: doc.id, ...doc.data() })
      );

      // Apply text search
      if (query) {
        const searchTerm = query.toLowerCase();
        projects = projects.filter(project => 
          project.name.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm) ||
          project.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Apply tags filter
      if (tags.length > 0) {
        projects = projects.filter(project => 
          tags.some(tag => project.tags.includes(tag.toLowerCase()))
        );
      }

      return projects;
    } catch (error) {
      throw new Error(`Failed to search projects: ${error.message}`);
    }
  }

  // Get featured projects
  static async getFeatured(limit = 10) {
    try {
      const snapshot = await db.collection('projects')
        .where('isActive', '==', true)
        .where('isPublic', '==', true)
        .where('isTemplate', '==', false)
        .orderBy('views', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => 
        new Project({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error(`Failed to get featured projects: ${error.message}`);
    }
  }

  // Update project
  async update(updateData) {
    try {
      const projectRef = db.collection('projects').doc(this.id);
      
      await projectRef.update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update local instance
      Object.assign(this, updateData);
      this.updatedAt = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  // Delete project (soft delete)
  async delete() {
    try {
      const projectRef = db.collection('projects').doc(this.id);
      
      await projectRef.update({
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      this.isActive = false;
      this.updatedAt = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  // Add like
  async addLike(userId) {
    try {
      const existingLike = this.likes.find(like => like.user === userId);
      if (existingLike) {
        return this; // Already liked
      }

      const projectRef = db.collection('projects').doc(this.id);
      
      await projectRef.update({
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

      const projectRef = db.collection('projects').doc(this.id);
      
      await projectRef.update({
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

  // Increment views
  async incrementViews() {
    try {
      const projectRef = db.collection('projects').doc(this.id);
      
      await projectRef.update({
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

  // Get primary image
  getPrimaryImage() {
    const primaryImage = this.images.find(img => img.isPrimary);
    return primaryImage || this.images[0] || null;
  }

  // Get like count
  get likeCount() {
    return this.likes.length;
  }

  // Get tuning count
  get tuningCount() {
    return this.tunings.length;
  }

  // Convert to JSON
  toJSON() {
    return { ...this };
  }
}

module.exports = Project;
