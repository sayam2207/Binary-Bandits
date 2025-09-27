const { db, admin } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class Car {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.brand = data.brand;
    this.model = data.model;
    this.year = data.year;
    this.category = data.category;
    this.description = data.description || '';
    this.specifications = data.specifications || {};
    this.images = data.images || [];
    this.model3D = data.model3D || {};
    this.rims = data.rims || [];
    this.tuningParts = data.tuningParts || [];
    this.price = data.price || {};
    this.tags = data.tags || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isFeatured = data.isFeatured || false;
    this.popularity = data.popularity || 0;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Create a new car
  static async create(carData) {
    try {
      const car = new Car(carData);
      const carRef = db.collection('cars').doc(car.id);
      
      await carRef.set({
        ...car,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return car;
    } catch (error) {
      throw new Error(`Failed to create car: ${error.message}`);
    }
  }

  // Get car by ID
  static async findById(id) {
    try {
      const carDoc = await db.collection('cars').doc(id).get();
      
      if (!carDoc.exists) {
        return null;
      }
      
      const carData = carDoc.data();
      if (!carData.isActive) {
        return null;
      }
      
      return new Car({ id: carDoc.id, ...carData });
    } catch (error) {
      throw new Error(`Failed to find car: ${error.message}`);
    }
  }

  // Search cars with filters
  static async search(options = {}) {
    try {
      const {
        query = '',
        brand = null,
        category = null,
        year = null,
        minPrice = null,
        maxPrice = null,
        tags = [],
        limit = 20,
        offset = 0,
        sortBy = 'popularity',
        sortDirection = 'desc'
      } = options;

      let carsQuery = db.collection('cars')
        .where('isActive', '==', true);

      // Apply filters
      if (brand) {
        carsQuery = carsQuery.where('brand', '==', brand);
      }
      
      if (category) {
        carsQuery = carsQuery.where('category', '==', category);
      }
      
      if (year) {
        carsQuery = carsQuery.where('year', '==', year);
      }

      // Order and limit
      carsQuery = carsQuery
        .orderBy(sortBy, sortDirection)
        .limit(limit)
        .offset(offset);

      const snapshot = await carsQuery.get();
      let cars = snapshot.docs.map(doc => 
        new Car({ id: doc.id, ...doc.data() })
      );

      // Apply text search and other filters
      if (query) {
        const searchTerm = query.toLowerCase();
        cars = cars.filter(car => 
          car.name.toLowerCase().includes(searchTerm) ||
          car.brand.toLowerCase().includes(searchTerm) ||
          car.model.toLowerCase().includes(searchTerm) ||
          car.description.toLowerCase().includes(searchTerm) ||
          car.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      if (minPrice || maxPrice) {
        cars = cars.filter(car => {
          const price = car.price.base || 0;
          if (minPrice && price < minPrice) return false;
          if (maxPrice && price > maxPrice) return false;
          return true;
        });
      }

      if (tags.length > 0) {
        cars = cars.filter(car => 
          tags.some(tag => car.tags.includes(tag.toLowerCase()))
        );
      }

      return cars;
    } catch (error) {
      throw new Error(`Failed to search cars: ${error.message}`);
    }
  }

  // Get featured cars
  static async getFeatured(limit = 10) {
    try {
      const snapshot = await db.collection('cars')
        .where('isActive', '==', true)
        .where('isFeatured', '==', true)
        .orderBy('popularity', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => 
        new Car({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error(`Failed to get featured cars: ${error.message}`);
    }
  }

  // Get car categories
  static async getCategories() {
    try {
      const snapshot = await db.collection('cars')
        .where('isActive', '==', true)
        .get();

      const categories = new Set();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.category) {
          categories.add(data.category);
        }
      });

      return Array.from(categories);
    } catch (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  // Get car brands
  static async getBrands() {
    try {
      const snapshot = await db.collection('cars')
        .where('isActive', '==', true)
        .get();

      const brands = new Set();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.brand) {
          brands.add(data.brand);
        }
      });

      return Array.from(brands);
    } catch (error) {
      throw new Error(`Failed to get brands: ${error.message}`);
    }
  }

  // Get car years
  static async getYears() {
    try {
      const snapshot = await db.collection('cars')
        .where('isActive', '==', true)
        .get();

      const years = new Set();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.year) {
          years.add(data.year);
        }
      });

      return Array.from(years).sort((a, b) => b - a);
    } catch (error) {
      throw new Error(`Failed to get years: ${error.message}`);
    }
  }

  // Get car tags
  static async getTags(limit = 50) {
    try {
      const snapshot = await db.collection('cars')
        .where('isActive', '==', true)
        .get();

      const tagCounts = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.tags) {
          data.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      return Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([name, count]) => ({ name, count }));
    } catch (error) {
      throw new Error(`Failed to get tags: ${error.message}`);
    }
  }

  // Get similar cars
  async getSimilar(limit = 6) {
    try {
      const snapshot = await db.collection('cars')
        .where('isActive', '==', true)
        .where('brand', '==', this.brand)
        .limit(limit + 1)
        .get();

      const similarCars = snapshot.docs
        .map(doc => new Car({ id: doc.id, ...doc.data() }))
        .filter(car => car.id !== this.id)
        .slice(0, limit);

      return similarCars;
    } catch (error) {
      throw new Error(`Failed to get similar cars: ${error.message}`);
    }
  }

  // Update car
  async update(updateData) {
    try {
      const carRef = db.collection('cars').doc(this.id);
      
      await carRef.update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update local instance
      Object.assign(this, updateData);
      this.updatedAt = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to update car: ${error.message}`);
    }
  }

  // Delete car (soft delete)
  async delete() {
    try {
      const carRef = db.collection('cars').doc(this.id);
      
      await carRef.update({
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      this.isActive = false;
      this.updatedAt = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to delete car: ${error.message}`);
    }
  }

  // Increment popularity
  async incrementPopularity() {
    try {
      const carRef = db.collection('cars').doc(this.id);
      
      await carRef.update({
        popularity: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      this.popularity += 1;
      this.updatedAt = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Failed to increment popularity: ${error.message}`);
    }
  }

  // Get primary image
  getPrimaryImage() {
    const primaryImage = this.images.find(img => img.isPrimary);
    return primaryImage || this.images[0] || null;
  }

  // Get default rims
  getDefaultRims() {
    return this.rims.find(rim => rim.isDefault) || this.rims[0] || null;
  }

  // Get paintable materials
  getPaintableMaterials() {
    return this.model3D.materials?.filter(material => material.isPaintable) || [];
  }

  // Get full car name
  get fullName() {
    return `${this.brand} ${this.model} ${this.year}`;
  }

  // Convert to JSON
  toJSON() {
    return { ...this };
  }
}

module.exports = Car;
