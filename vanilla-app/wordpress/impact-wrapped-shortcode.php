<?php
/**
 * Plugin Name: Impact Wrapped Shortcode
 * Description: Adds a shortcode to embed the Impact Wrapped application
 * Version: 1.0
 * Author: Your Name
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Main Impact Wrapped Shortcode Class
 */
class Impact_Wrapped_Shortcode {
    /**
     * Constructor
     */
    public function __construct() {
        // Register shortcode
        add_shortcode('impact_wrapped', array($this, 'render_shortcode'));
        
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        
        // Register REST API routes
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }
    
    /**
     * Enqueue necessary scripts and styles
     */
    public function enqueue_scripts() {
        // Only enqueue on pages where the shortcode is used
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'impact_wrapped')) {
            // Enqueue CSS files
            wp_enqueue_style(
                'impact-wrapped-styles',
                plugin_dir_url(__FILE__) . 'css/styles.css',
                array(),
                '1.0.0'
            );
            
            // Enqueue JavaScript files
            wp_enqueue_script(
                'impact-wrapped-utils',
                plugin_dir_url(__FILE__) . 'js/util.js',
                array(),
                '1.0.0',
                true
            );
            
            wp_enqueue_script(
                'impact-wrapped-components',
                plugin_dir_url(__FILE__) . 'js/components.js',
                array('impact-wrapped-utils'),
                '1.0.0',
                true
            );
            
            wp_enqueue_script(
                'impact-wrapped-router',
                plugin_dir_url(__FILE__) . 'js/router.js',
                array('impact-wrapped-utils'),
                '1.0.0',
                true
            );
            
            wp_enqueue_script(
                'impact-wrapped-toast',
                plugin_dir_url(__FILE__) . 'js/toast.js',
                array('impact-wrapped-utils'),
                '1.0.0',
                true
            );
            
            wp_enqueue_script(
                'impact-wrapped-api',
                plugin_dir_url(__FILE__) . 'js/api.js',
                array('impact-wrapped-utils'),
                '1.0.0',
                true
            );
            
            wp_enqueue_script(
                'impact-wrapped-auth',
                plugin_dir_url(__FILE__) . 'js/auth.js',
                array('impact-wrapped-api', 'impact-wrapped-toast'),
                '1.0.0',
                true
            );
            
            wp_enqueue_script(
                'impact-wrapped-pages',
                plugin_dir_url(__FILE__) . 'js/pages.js',
                array('impact-wrapped-components', 'impact-wrapped-auth'),
                '1.0.0',
                true
            );
            
            wp_enqueue_script(
                'impact-wrapped-admin-pages',
                plugin_dir_url(__FILE__) . 'js/admin-pages.js',
                array('impact-wrapped-components', 'impact-wrapped-auth'),
                '1.0.0',
                true
            );
            
            wp_enqueue_script(
                'impact-wrapped-wordpress',
                plugin_dir_url(__FILE__) . 'js/wordpress-integration.js',
                array('impact-wrapped-router', 'impact-wrapped-api'),
                '1.0.0',
                true
            );
            
            wp_enqueue_script(
                'impact-wrapped-app',
                plugin_dir_url(__FILE__) . 'js/app.js',
                array(
                    'impact-wrapped-utils',
                    'impact-wrapped-components',
                    'impact-wrapped-router',
                    'impact-wrapped-api',
                    'impact-wrapped-auth',
                    'impact-wrapped-pages',
                    'impact-wrapped-admin-pages',
                    'impact-wrapped-wordpress',
                    'impact-wrapped-toast'
                ),
                '1.0.0',
                true
            );
            
            // Add inline script to initialize WordPress integration
            $script = "
                document.addEventListener('DOMContentLoaded', function() {
                    if (window.ImpactWrappedWP) {
                        window.ImpactWrappedWP.init({
                            baseUrl: '" . esc_js(rest_url('impact-wrapped/v1')) . "',
                            apiPrefix: '',
                            mountPoint: '#impact-wrapped-app'
                        }).mount();
                    }
                });
            ";
            
            // Define a proper initialization script
            $script = "
                document.addEventListener('DOMContentLoaded', function() {
                    if (window.ImpactWrappedWP) {
                        // Configure WordPress integration
                        window.ImpactWrappedWP.init({
                            baseUrl: '" . esc_js(rest_url('impact-wrapped/v1')) . "',
                            apiPrefix: '',
                            mountPoint: '#impact-wrapped-app'
                        }).mount().then(function(app) {
                            console.log('Impact Wrapped initialized successfully');
                            
                            // Set initial page if provided
                            var initialPage = document.querySelector('#impact-wrapped-app').dataset.initialPage;
                            if (initialPage && app && app.navigate) {
                                app.navigate('/' + initialPage);
                            }
                        }).catch(function(error) {
                            console.error('Failed to initialize Impact Wrapped:', error);
                        });
                    }
                });
            ";
            
            wp_add_inline_script('impact-wrapped-app', $script);
        }
    }
    
    /**
     * Register REST API routes to proxy requests to the Impact Wrapped backend
     */
    public function register_rest_routes() {
        register_rest_route('impact-wrapped/v1', '/proxy/(?P<path>.*)', array(
            'methods' => 'GET,POST,PUT,DELETE',
            'callback' => array($this, 'proxy_api_request'),
            'permission_callback' => '__return_true',
        ));
    }
    
    /**
     * Proxy API requests to the Impact Wrapped backend
     * 
     * @param WP_REST_Request $request Full data about the request
     * @return WP_REST_Response|WP_Error Response object
     */
    public function proxy_api_request($request) {
        // Get the path parameter
        $path = $request->get_param('path');
        
        // Get the Impact Wrapped API endpoint from options (default: http://localhost:5000)
        $api_endpoint = get_option('impact_wrapped_api_endpoint', 'http://localhost:5000');
        
        // Build the full URL
        $url = trailingslashit($api_endpoint) . $path;
        
        // Get the request method
        $method = $request->get_method();
        
        // Set up the arguments for wp_remote_request
        $args = array(
            'method' => $method,
            'timeout' => 30,
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
        );
        
        // If it's a POST or PUT request, get the body
        if ($method === 'POST' || $method === 'PUT') {
            $body = $request->get_body();
            $args['body'] = $body;
        }
        
        // Make the request
        $response = wp_remote_request($url, $args);
        
        // Check for errors
        if (is_wp_error($response)) {
            return new WP_Error(
                'api_error',
                $response->get_error_message(),
                array('status' => 500)
            );
        }
        
        // Get the status code
        $status_code = wp_remote_retrieve_response_code($response);
        
        // Get the body
        $body = wp_remote_retrieve_body($response);
        
        // Try to decode the body as JSON
        $json_body = json_decode($body, true);
        
        // Return the response
        $rest_response = new WP_REST_Response(
            $json_body !== null ? $json_body : $body,
            $status_code
        );
        
        return $rest_response;
    }
    
    /**
     * Render the shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string Shortcode output
     */
    public function render_shortcode($atts) {
        // Parse attributes
        $atts = shortcode_atts(
            array(
                'theme' => 'light', // light or dark
                'width' => '100%',
                'height' => 'auto',
                'initial_page' => 'home', // home, login, register, admin, etc.
            ),
            $atts,
            'impact_wrapped'
        );
        
        // Sanitize attributes
        $theme = sanitize_text_field($atts['theme']);
        $width = sanitize_text_field($atts['width']);
        $height = sanitize_text_field($atts['height']);
        $initial_page = sanitize_text_field($atts['initial_page']);
        
        // Create container with theme class
        $output = '<div id="impact-wrapped-app" class="impact-wrapped-container ' . esc_attr($theme) . '-theme" ';
        $output .= 'style="width: ' . esc_attr($width) . '; height: ' . esc_attr($height) . ';" ';
        $output .= 'data-initial-page="' . esc_attr($initial_page) . '">';
        $output .= '<div class="impact-wrapped-loading">Loading Impact Wrapped...</div>';
        $output .= '</div>';
        
        return $output;
    }
}

// Initialize the plugin
new Impact_Wrapped_Shortcode();

/**
 * Add settings page for Impact Wrapped
 */
class Impact_Wrapped_Settings {
    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_menu', array($this, 'add_settings_page'));
        add_action('admin_init', array($this, 'register_settings'));
    }
    
    /**
     * Add settings page
     */
    public function add_settings_page() {
        add_options_page(
            'Impact Wrapped Settings',
            'Impact Wrapped',
            'manage_options',
            'impact-wrapped-settings',
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting(
            'impact_wrapped_settings',
            'impact_wrapped_api_endpoint',
            array(
                'type' => 'string',
                'default' => 'http://localhost:5000',
                'sanitize_callback' => 'esc_url_raw',
            )
        );
        
        add_settings_section(
            'impact_wrapped_api_settings',
            'API Settings',
            array($this, 'render_api_settings_section'),
            'impact-wrapped-settings'
        );
        
        add_settings_field(
            'impact_wrapped_api_endpoint',
            'API Endpoint',
            array($this, 'render_api_endpoint_field'),
            'impact-wrapped-settings',
            'impact_wrapped_api_settings'
        );
    }
    
    /**
     * Render API settings section
     */
    public function render_api_settings_section() {
        echo '<p>Configure the API endpoint for the Impact Wrapped application.</p>';
    }
    
    /**
     * Render API endpoint field
     */
    public function render_api_endpoint_field() {
        $value = get_option('impact_wrapped_api_endpoint', 'http://localhost:5000');
        echo '<input type="url" name="impact_wrapped_api_endpoint" value="' . esc_attr($value) . '" class="regular-text" />';
        echo '<p class="description">The base URL of your Impact Wrapped API server.</p>';
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <form action="options.php" method="post">
                <?php
                settings_fields('impact_wrapped_settings');
                do_settings_sections('impact-wrapped-settings');
                submit_button('Save Settings');
                ?>
            </form>
            
            <h2>Usage</h2>
            <p>Use the <code>[impact_wrapped]</code> shortcode to embed the Impact Wrapped application on any page or post.</p>
            
            <h3>Shortcode Attributes</h3>
            <table class="form-table">
                <tr>
                    <th scope="row">theme</th>
                    <td>
                        <code>light</code> or <code>dark</code> (default: <code>light</code>)<br>
                        <span class="description">The visual theme of the application.</span>
                    </td>
                </tr>
                <tr>
                    <th scope="row">width</th>
                    <td>
                        CSS width value (default: <code>100%</code>)<br>
                        <span class="description">The width of the application container.</span>
                    </td>
                </tr>
                <tr>
                    <th scope="row">height</th>
                    <td>
                        CSS height value (default: <code>auto</code>)<br>
                        <span class="description">The height of the application container.</span>
                    </td>
                </tr>
                <tr>
                    <th scope="row">initial_page</th>
                    <td>
                        Page name (default: <code>home</code>)<br>
                        <span class="description">The initial page to show when loading the application.</span>
                    </td>
                </tr>
            </table>
            
            <h3>Example</h3>
            <p><code>[impact_wrapped theme="dark" width="800px" height="600px" initial_page="login"]</code></p>
        </div>
        <?php
    }
}

// Initialize the settings
new Impact_Wrapped_Settings();