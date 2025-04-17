# Impact Wrapped WordPress Integration

This directory contains files for integrating the Impact Wrapped application into a WordPress website.

## Overview

The Impact Wrapped WordPress integration allows you to embed the full Impact Wrapped application within any WordPress page or post using a simple shortcode.

## Files

- `impact-wrapped-shortcode.php` - The main WordPress plugin file
- `README.md` - This documentation file

## Installation

1. Create a new directory called `impact-wrapped` in your WordPress plugins directory (`wp-content/plugins/`)
2. Copy all files from the vanilla-app directory to the `impact-wrapped` directory
3. Ensure the file structure is as follows:
   ```
   wp-content/plugins/impact-wrapped/
   ├── css/
   │   └── styles.css
   ├── js/
   │   ├── admin-pages.js
   │   ├── api.js
   │   ├── app.js
   │   ├── auth.js
   │   ├── components.js
   │   ├── pages.js
   │   ├── router.js
   │   ├── toast.js
   │   ├── util.js
   │   └── wordpress-integration.js
   ├── wordpress/
   │   ├── impact-wrapped-shortcode.php
   │   └── README.md
   ├── images/
   │   └── impact-wrapped-logo.svg
   └── index.html
   ```
4. In WordPress admin panel, go to the Plugins page and activate "Impact Wrapped Shortcode"
5. Configure the API endpoint in Settings > Impact Wrapped

## Usage

### Basic Shortcode

Add the Impact Wrapped application to any page or post using the shortcode:

```
[impact_wrapped]
```

### Shortcode Attributes

The shortcode supports the following attributes:

- `theme` - Visual theme of the application (`light` or `dark`, default: `light`)
- `width` - Width of the application container (CSS value, default: `100%`)
- `height` - Height of the application container (CSS value, default: `auto`)
- `initial_page` - Initial page to display (default: `home`)

### Example with Attributes

```
[impact_wrapped theme="dark" width="800px" height="600px" initial_page="login"]
```

## API Configuration

The WordPress integration creates a proxy to communicate with your Impact Wrapped API server. You'll need to configure the API endpoint in the WordPress admin panel:

1. Go to Settings > Impact Wrapped
2. Enter the URL of your Impact Wrapped API server (e.g., `https://api.yourdomain.com`)
3. Save Changes

## Customization

### CSS Customization

You can add custom CSS to match your WordPress theme by adding styles to your theme's `style.css` file. Target the `#impact-wrapped-app` container to customize the appearance.

Example:

```css
#impact-wrapped-app {
  font-family: 'Your Font', sans-serif;
  --primary-color: #your-brand-color;
}
```

### Advanced Integration

For advanced customization, you can modify the `wordpress-integration.js` file to change how the application integrates with WordPress.

## Troubleshooting

Common issues and solutions:

1. **Application doesn't load**: Check that all JavaScript files are correctly loaded. Check the browser console for errors.

2. **API connection fails**: Verify the API endpoint in Settings > Impact Wrapped and ensure your API server is running and accessible.

3. **Styling conflicts**: If there are CSS conflicts with your WordPress theme, you may need to add more specific CSS selectors to override the theme styles.