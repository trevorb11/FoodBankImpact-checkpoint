# Impact Wrapped - Vanilla HTML/CSS/JS Implementation

This is a vanilla HTML, CSS, and JavaScript implementation of the Impact Wrapped application, converted from the original TypeScript/React version.

## Structure

The application follows a component-based architecture using vanilla JavaScript:

- `/index.html` - Main HTML entry point
- `/css/styles.css` - Custom CSS styles
- `/js/` - JavaScript modules:
  - `util.js` - Utility functions
  - `api.js` - API client for backend communication
  - `auth.js` - Authentication system
  - `toast.js` - Toast notification system
  - `router.js` - Client-side router
  - `components.js` - UI components
  - `pages.js` - Page templates
  - `app.js` - Main application entry point

## Running the Application

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open your browser and navigate to: `http://localhost:3000`

## Features

- Client-side routing
- Authentication system
- Toast notifications
- Responsive design
- Component-based architecture

## Backend

This application uses the same Express backend API as the original TypeScript version. All API routes remain unchanged.

## Browser Support

The application uses modern JavaScript features and should work in all modern browsers.