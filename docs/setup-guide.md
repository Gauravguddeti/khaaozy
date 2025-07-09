# Project Documentation

## Getting Started

This documentation will guide you through setting up and running the Vishwakarma University Canteen App.

## Prerequisites

- **Android Development**:
  - Android Studio Arctic Fox or later
  - Java 11 or later
  - Android SDK API 24+

- **Python Development**:
  - Python 3.9+
  - Tesseract OCR
  - pip package manager

- **Web Development**:
  - Node.js 18+
  - npm or yarn

- **Backend**:
  - Supabase account
  - Supabase CLI

## Quick Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd canteenapp
```

### 2. Set up Supabase Backend
```bash
cd supabase

# Install Supabase CLI (if not installed)
npm install -g supabase

# Initialize Supabase
supabase start

# Apply database migrations
supabase db reset
```

### 3. Configure Environment Variables

Create environment files for each component:

#### Android App
Create `android-app/app/src/main/assets/supabase.properties`:
```properties
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

#### AI Menu Parser
Create `ai-menu-parser/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

#### Admin Dashboard
Create `admin-dashboard/.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Set up AI Menu Parser
```bash
cd ai-menu-parser

# Install Python dependencies
pip install -r requirements.txt

# Install Tesseract OCR
# Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
# macOS: brew install tesseract
# Ubuntu: sudo apt-get install tesseract-ocr

# Start the API server
python main.py
```

### 5. Set up Admin Dashboard
```bash
cd admin-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### 6. Set up Android App
1. Open `android-app/` directory in Android Studio
2. Wait for Gradle sync to complete
3. Update `BuildConfig` with your Supabase credentials
4. Run the app on a device or emulator

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Android App   │    │  Admin Dashboard│    │ AI Menu Parser  │
│ (Kotlin+Compose)│    │  (React+TS)     │    │ (Python+OCR)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │    Supabase Backend     │
                    │ (PostgreSQL+Auth+       │
                    │  Storage+Functions)     │
                    └─────────────────────────┘
```

## User Flows

### Student/Faculty Flow
1. **Sign Up/Login** → Select college
2. **Browse Canteens** → View by college
3. **View Menu** → Filter by category/type
4. **Add to Cart** → Select dine-in/takeaway
5. **Place Order** → Receive order number
6. **Track Status** → Real-time updates
7. **Provide Feedback** → Rate experience

### Owner Flow
1. **Owner Login** → Dashboard overview
2. **Manage Menu** → AI upload or manual entry
3. **View Orders** → Update status
4. **Analytics** → Sales reports

### Admin Flow
1. **Admin Login** → Web dashboard
2. **Manage Colleges** → Add/edit institutions
3. **Manage Canteens** → Assign owners
4. **User Management** → Monitor accounts
5. **Analytics** → System-wide reports

## API Documentation

### Supabase Tables

#### colleges
- `id` (UUID, Primary Key)
- `name` (Text)
- `location` (Text)
- `is_active` (Boolean)

#### users
- `id` (UUID, Primary Key, refs auth.users)
- `email` (Text, Unique)
- `role` (Enum: user, owner, admin)
- `college_id` (UUID, refs colleges)
- `name` (Text)

#### canteens
- `id` (UUID, Primary Key)
- `name` (Text)
- `college_id` (UUID, refs colleges)
- `owner_id` (UUID, refs users)
- `status` (Enum: open, closed, etc.)

#### menu_items
- `id` (UUID, Primary Key)
- `canteen_id` (UUID, refs canteens)
- `name` (Text)
- `price` (Decimal)
- `category` (Enum)
- `type` (Enum: veg, non_veg, etc.)

#### orders
- `id` (UUID, Primary Key)
- `user_id` (UUID, refs users)
- `canteen_id` (UUID, refs canteens)
- `status` (Enum)
- `order_type` (Enum: dine_in, takeaway)

### AI Menu Parser API

#### POST /parse-menu
Upload menu image for OCR processing.

**Request:**
```bash
curl -X POST "http://localhost:8000/parse-menu" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@menu.jpg"
```

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "name": "Cold Coffee",
      "price": 50.0,
      "category": "beverages"
    }
  ],
  "confidence": 0.85
}
```

## Security

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access data from their college
- Owners can only manage their assigned canteens
- Admins have system-wide access

### Authentication
- Supabase Auth with JWT tokens
- Role-based access control
- Secure password policies

### Data Privacy
- Multi-tenant architecture
- College-level data isolation
- GDPR compliance ready

## Deployment

### Android App
1. Generate signed APK/AAB
2. Upload to Google Play Console
3. Configure Firebase for notifications

### Admin Dashboard
```bash
npm run build
# Deploy to Vercel/Netlify
```

### AI Menu Parser
```bash
# Docker deployment
docker build -t ai-menu-parser .
docker run -p 8000:8000 ai-menu-parser
```

### Supabase
- Production database setup
- Environment-specific configurations
- Backup and monitoring

## Troubleshooting

### Common Issues

1. **Android build errors**
   - Clean and rebuild project
   - Check Gradle sync
   - Verify SDK versions

2. **OCR not working**
   - Install Tesseract OCR
   - Check image quality
   - Verify file permissions

3. **Database connection issues**
   - Check Supabase credentials
   - Verify network connectivity
   - Review RLS policies

### Getting Help

- Check the GitHub Issues
- Review component-specific READMEs
- Contact the development team

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
