const { db, admin } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.username = data.username;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.avatar = data.avatar || null;
    this.role = data.role || 'user';
    this.isEmailVerified = data.isEmailVerified || false;
    this.lastLogin = data.lastLogin || new Date();
    this.preferences = data.preferences || {
      theme: 'dark',
      language: 'en',
      notifications: {
        email: true,
        push: true
      }
    };
    this.socialAccounts = data.socialAccounts || {
      google: null,
      microsoft: null
    };
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Create a new user
  static async create(userData) {
    try {
      const user = new User(userData);
      const userRef = db.collection('users').doc(user.id);
      
      await userRef.set({
        ...user,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return user;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Get user by ID
  static async findById(id) {
    try {
      const userDoc = await db.collection('users').doc(id).get();
      
      if (!userDoc.exists) {
        return null;
      }
      
      return new User({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  // Get user by email
  static async findByEmail(email) {
    try {
      const usersSnapshot = await db.collection('users')
        .where('email', '==', email)
        .where('isActive', '==', true)
        .limit(1)
        .get();
      
      if (usersSnapshot.empty) {
        return null;
      }
      
      const userDoc = usersSnapshot.docs[0];
      return new User({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  // Get user by username
  static async findByUsername(username) {
    try {
      const usersSnapshot = await db.collection('users')
        .where('username', '==', username)
        .where('isActive', '==', true)
        .limit(1)
        .get();
      
      if (usersSnapshot.empty) {
        return null;
      }
      
      const userDoc = usersSnapshot.docs[0];
      return new User({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
      throw new Error(`Failed to find user by username: ${error.message}`);
    }
  }

  // Update user
  async update(updateData) {
    try {
      const userRef = db.collection('users').doc(this.id);
      
      await userRef.update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update local instance
      Object.assign(this, updateData);
      this.updatedAt = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Delete user (soft delete)
  async delete() {
    try {
      const userRef = db.collection('users').doc(this.id);
      
      await userRef.update({
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      this.isActive = false;
      this.updatedAt = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Get all users with pagination
  static async findAll(options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        orderBy = 'createdAt',
        orderDirection = 'desc',
        role = null
      } = options;

      let query = db.collection('users')
        .where('isActive', '==', true);

      if (role) {
        query = query.where('role', '==', role);
      }

      query = query
        .orderBy(orderBy, orderDirection)
        .limit(limit)
        .offset(offset);

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => 
        new User({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error(`Failed to find users: ${error.message}`);
    }
  }

  // Count users
  static async count(filters = {}) {
    try {
      let query = db.collection('users').where('isActive', '==', true);

      if (filters.role) {
        query = query.where('role', '==', filters.role);
      }

      if (filters.isEmailVerified !== undefined) {
        query = query.where('isEmailVerified', '==', filters.isEmailVerified);
      }

      const snapshot = await query.get();
      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to count users: ${error.message}`);
    }
  }

  // Check if email exists
  static async emailExists(email, excludeId = null) {
    try {
      let query = db.collection('users')
        .where('email', '==', email)
        .where('isActive', '==', true);

      const snapshot = await query.get();
      
      if (excludeId) {
        return snapshot.docs.some(doc => doc.id !== excludeId);
      }
      
      return !snapshot.empty;
    } catch (error) {
      throw new Error(`Failed to check email existence: ${error.message}`);
    }
  }

  // Check if username exists
  static async usernameExists(username, excludeId = null) {
    try {
      let query = db.collection('users')
        .where('username', '==', username)
        .where('isActive', '==', true);

      const snapshot = await query.get();
      
      if (excludeId) {
        return snapshot.docs.some(doc => doc.id !== excludeId);
      }
      
      return !snapshot.empty;
    } catch (error) {
      throw new Error(`Failed to check username existence: ${error.message}`);
    }
  }

  // Get user statistics
  static async getStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        verifiedUsers,
        adminUsers
      ] = await Promise.all([
        this.count(),
        this.count({ isEmailVerified: true }),
        this.count({ isEmailVerified: true }),
        this.count({ role: 'admin' })
      ]);

      return {
        totalUsers,
        activeUsers,
        verifiedUsers,
        adminUsers
      };
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
  }

  // Get user's full name
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    const userObj = { ...this };
    delete userObj.password;
    return userObj;
  }

  // Convert to public JSON (for other users)
  toPublicJSON() {
    return {
      id: this.id,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      avatar: this.avatar,
      role: this.role,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;