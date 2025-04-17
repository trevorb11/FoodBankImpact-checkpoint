# Impact Wrapped - Food Bank Donor Impact Visualization

A dynamic platform empowering food bank donor experiences through innovative impact visualization and storytelling technologies.

## Project Structure

This project contains two implementations of the same application:

1. **TypeScript React Implementation** (original)
   - Located in the root directory
   - Uses TypeScript, React, and modern frontend frameworks
   - Full-stack application with Express backend

2. **Vanilla HTML/CSS/JS Implementation** (converted)
   - Located in the `vanilla-app` directory
   - Uses vanilla JavaScript, HTML, and CSS
   - Preserves all functionality and appearance of the original

## Key Features

- Interactive data visualization
- Responsive web design
- Admin management tools
- Social impact reporting
- Enhanced donor engagement
- Personalized impact metrics

## Running the Application

### TypeScript React Version

This is the default version. To run it:

```bash
# Run the application
./start.sh
```

### Vanilla HTML/CSS/JS Version

To run the vanilla version:

```bash
# Switch to vanilla version
./switch-version.sh vanilla

# Install dependencies
cd vanilla-app
npm install

# Start the application
npm start
```

### Switching Between Versions

Use the included utility script:

```bash
# Switch to vanilla version
./switch-version.sh vanilla

# Switch back to TypeScript version
./switch-version.sh typescript
```

## Technical Details

Both implementations share the same Express backend API, but differ in frontend technologies:

- **TypeScript React Version**
  - React for UI components
  - TypeScript for type safety
  - TanStack Query for data fetching
  - Wouter for routing
  - Shadcn UI for component styling

- **Vanilla Version**
  - Custom component system
  - Custom router implementation
  - Vanilla JavaScript with ES6+ features
  - Pure CSS for styling (with TailwindCSS)
  - DOM manipulation for UI updates

## Deployment

Both versions can be deployed on any standard Node.js hosting platform.