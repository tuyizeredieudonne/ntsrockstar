# NTS Rockstar Party Event Booking Website

A modern, full-stack event booking website for the NTS Rockstar Party, built with Next.js, Material UI, and MongoDB.

## Features

- 🎫 Ticket booking system with dynamic pricing
- 🎨 Modern, responsive UI with Material UI components
- 🔒 Secure authentication with NextAuth.js
- 📊 Admin dashboard for managing bookings and artists
- 🎸 Artist management system
- 📱 Mobile-friendly design
- ⚡ Serverless architecture with Next.js API routes
- 🗄️ MongoDB database integration
- ☁️ Cloudinary for image storage

## Tech Stack

- **Frontend:**
  - Next.js 13+ (App Router)
  - Material UI v5
  - Formik & Yup for form handling
  - date-fns for date manipulation

- **Backend:**
  - Next.js API Routes
  - MongoDB with Mongoose
  - NextAuth.js for authentication
  - Cloudinary for image storage

## Getting Started

### Prerequisites

- Node.js 16.x or later
- MongoDB instance
- Cloudinary account
- Environment variables (see below)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_uri

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rockticket.git
   cd rockticket
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
rockticket/
├── app/                    # Next.js 13 App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard pages
│   └── (auth)/            # Authentication pages
├── components/            # Reusable components
├── lib/                   # Utility functions and configurations
├── models/               # MongoDB models
├── public/               # Static assets
└── styles/               # Global styles
```

## Features in Detail

### Home Page
- Hero section with event details
- Countdown timer for early bird discounts
- Featured artists showcase
- Event information and pricing

### Booking Page
- Multi-step booking form
- Dynamic pricing based on date
- Payment screenshot upload
- Booking confirmation

### Admin Dashboard
- Overview statistics
- Booking management
- Artist management
- Event settings
- Recent activity feed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Material UI](https://mui.com/)
- [MongoDB](https://www.mongodb.com/)
- [Cloudinary](https://cloudinary.com/) 