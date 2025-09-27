# Car Tuning Web Application - Backend API

A comprehensive backend API for a car tuning web application with 3D model support, user authentication, and advanced customization features.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Email verification
  - Password reset functionality
  - Role-based access control (User, Admin, Moderator)
  - Social login support (Google, Microsoft)

- **Car Management**
  - CRUD operations for cars
  - Advanced search and filtering
  - Car specifications and 3D models
  - Rim and tuning parts management
  - Car categories and brands

- **Tuning System**
  - Paint customization (colors, finishes, materials)
  - Performance modifications (engine, exhaust, suspension, brakes)
  - Exterior modifications (body kits, spoilers, lights)
  - Interior modifications (seats, steering wheel, dashboard)
  - Performance statistics calculation

- **File Upload System**
  - Image uploads (avatars, car images, tuning photos)
  - 3D model uploads (GLB, GLTF, FBX, OBJ)
  - Cloudinary integration for cloud storage
  - File validation and size limits

- **Social Features**
  - Like/unlike tunings
  - Comments system
  - Share tunings
  - User profiles and statistics
  - Activity feeds

- **Real-time Features**
  - Socket.io integration
  - Live tuning updates
  - Real-time notifications

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Real-time**: Socket.io
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tuning-web/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp config.env.example .env
   ```
   
   Fill in the required environment variables in `.env`:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/car-tuning-app
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Email
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Forgot password
- `PUT /api/auth/resetpassword/:token` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/resend-verification` - Resend verification

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (Admin)
- `GET /api/users/:id/tunings` - Get user's tunings
- `GET /api/users/:id/projects` - Get user's projects
- `GET /api/users/:id/likes` - Get user's liked tunings
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users/:id/activity` - Get user activity feed

### Cars
- `GET /api/cars` - Get all cars
- `GET /api/cars/featured` - Get featured cars
- `GET /api/cars/:id` - Get car by ID
- `POST /api/cars` - Create car (Admin)
- `PUT /api/cars/:id` - Update car (Admin)
- `DELETE /api/cars/:id` - Delete car (Admin)
- `GET /api/cars/meta/categories` - Get car categories
- `GET /api/cars/meta/brands` - Get car brands
- `GET /api/cars/meta/years` - Get car years
- `GET /api/cars/meta/tags` - Get car tags
- `GET /api/cars/:id/similar` - Get similar cars
- `GET /api/cars/:id/parts` - Get car tuning parts
- `GET /api/cars/:id/rims` - Get car rims

### Tuning
- `GET /api/tuning` - Get all tunings
- `GET /api/tuning/featured` - Get featured tunings
- `GET /api/tuning/templates` - Get tuning templates
- `GET /api/tuning/:id` - Get tuning by ID
- `POST /api/tuning` - Create tuning
- `PUT /api/tuning/:id` - Update tuning
- `DELETE /api/tuning/:id` - Delete tuning
- `POST /api/tuning/:id/like` - Like/unlike tuning
- `POST /api/tuning/:id/comments` - Add comment
- `GET /api/tuning/:id/comments` - Get comments
- `POST /api/tuning/:id/share` - Share tuning
- `GET /api/tuning/:id/similar` - Get similar tunings
- `POST /api/tuning/:id/clone` - Clone tuning
- `GET /api/tuning/stats/overview` - Get tuning statistics

### File Upload
- `POST /api/upload/avatar` - Upload avatar
- `POST /api/upload/car-images` - Upload car images (Admin)
- `POST /api/upload/car-model` - Upload car 3D model (Admin)
- `POST /api/upload/rim-model` - Upload rim model (Admin)
- `POST /api/upload/tuning-images` - Upload tuning images
- `POST /api/upload/multiple` - Upload multiple files
- `DELETE /api/upload/:publicId` - Delete file
- `GET /api/upload/stats` - Get upload statistics (Admin)

## Database Models

### User
- Personal information (name, email, username)
- Authentication data (password, tokens)
- Preferences and settings
- Social accounts integration
- Role-based permissions

### Car
- Basic information (name, brand, model, year)
- Specifications (engine, performance, dimensions)
- 3D model data and materials
- Images and media
- Tuning parts and rims
- Categories and tags

### Tuning
- User and car references
- Customization data (paint, performance, exterior, interior)
- Performance statistics
- Social features (likes, comments, shares)
- Images and media
- Public/private settings

### Project
- User reference
- Collection of tunings
- Project metadata
- Social features

## Security Features

- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control
- **Rate Limiting**: API request rate limiting
- **Input Validation**: Comprehensive input validation
- **File Upload Security**: File type and size validation
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Password Security**: Bcrypt hashing with salt rounds

## Error Handling

- Centralized error handling middleware
- Custom error classes
- Detailed error logging
- User-friendly error messages
- Development vs production error responses

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car-tuning-app
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-production-cloud-name
CLOUDINARY_API_KEY=your-production-api-key
CLOUDINARY_API_SECRET=your-production-api-secret
```

### Docker Deployment
```bash
# Build Docker image
docker build -t car-tuning-backend .

# Run container
docker run -p 5000:5000 --env-file .env car-tuning-backend
```

## API Documentation

The API follows RESTful conventions and returns JSON responses. All responses include a `success` boolean field and appropriate HTTP status codes.

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... }
}
```

### Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository.
