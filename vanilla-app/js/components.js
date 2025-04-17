/**
 * UI components for Impact Wrapped application
 */

const Components = {
  /**
   * Navbar component
   */
  Navbar: {
    /**
     * Renders the navbar
     * @param {boolean} isAuthenticated Whether user is authenticated
     * @param {Object} user User object
     * @returns {HTMLElement} Navbar element
     */
    render(isAuthenticated = false, user = null) {
      const navbar = document.createElement('nav');
      navbar.className = 'navbar';
      
      // Logo
      const logo = document.createElement('a');
      logo.href = '/';
      logo.className = 'navbar-logo';
      logo.innerHTML = `
        <img src="/images/impact-wrapped-logo.svg" alt="Impact Wrapped" width="32" height="32" />
        <span>Impact Wrapped</span>
      `;
      
      // Links
      const links = document.createElement('div');
      links.className = 'navbar-links';
      
      if (isAuthenticated) {
        // Admin link
        const adminLink = document.createElement('a');
        adminLink.href = '/admin';
        adminLink.className = 'navbar-link';
        adminLink.textContent = 'Dashboard';
        adminLink.addEventListener('click', (e) => {
          e.preventDefault();
          Router.navigate('/admin');
        });
        
        // Logout link
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.className = 'navbar-link';
        logoutLink.textContent = 'Logout';
        logoutLink.addEventListener('click', async (e) => {
          e.preventDefault();
          try {
            await Auth.logout();
            Router.navigate('/');
            Toast.success({
              title: 'Logged out',
              description: 'You have been logged out successfully.'
            });
          } catch (error) {
            console.error('Logout error:', error);
            Toast.error({
              title: 'Logout failed',
              description: error.message || 'Failed to log out. Please try again.'
            });
          }
        });
        
        links.appendChild(adminLink);
        links.appendChild(logoutLink);
      } else {
        // Login link
        const loginLink = document.createElement('a');
        loginLink.href = '/auth/login';
        loginLink.className = 'navbar-link';
        loginLink.textContent = 'Login';
        loginLink.addEventListener('click', (e) => {
          e.preventDefault();
          Router.navigate('/auth/login');
        });
        
        // Register link
        const registerLink = document.createElement('a');
        registerLink.href = '/auth/register';
        registerLink.className = 'navbar-link';
        registerLink.textContent = 'Register';
        registerLink.addEventListener('click', (e) => {
          e.preventDefault();
          Router.navigate('/auth/register');
        });
        
        links.appendChild(loginLink);
        links.appendChild(registerLink);
      }
      
      navbar.appendChild(logo);
      navbar.appendChild(links);
      
      return navbar;
    }
  },
  
  /**
   * Admin sidebar component
   */
  AdminSidebar: {
    /**
     * Renders the admin sidebar
     * @param {string} activePage Active page
     * @returns {HTMLElement} Sidebar element
     */
    render(activePage = 'dashboard') {
      const sidebar = document.createElement('aside');
      sidebar.className = 'admin-sidebar';
      
      // Header
      const header = document.createElement('div');
      header.className = 'admin-sidebar-header';
      header.textContent = 'Food Bank Tools';
      
      // Links
      const links = document.createElement('div');
      links.className = 'admin-sidebar-links';
      
      // Dashboard link
      const dashboardLink = document.createElement('a');
      dashboardLink.href = '/admin';
      dashboardLink.className = `admin-sidebar-link ${activePage === 'dashboard' ? 'active' : ''}`;
      dashboardLink.innerHTML = `
        <span>📊</span>
        <span>Dashboard</span>
      `;
      dashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate('/admin');
      });
      
      // Upload link
      const uploadLink = document.createElement('a');
      uploadLink.href = '/admin/upload-new';
      uploadLink.className = `admin-sidebar-link ${activePage === 'upload' ? 'active' : ''}`;
      uploadLink.innerHTML = `
        <span>📤</span>
        <span>Upload Donors</span>
      `;
      uploadLink.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate('/admin/upload-new');
      });
      
      // Configure link
      const configureLink = document.createElement('a');
      configureLink.href = '/admin/configure';
      configureLink.className = `admin-sidebar-link ${activePage === 'configure' ? 'active' : ''}`;
      configureLink.innerHTML = `
        <span>⚙️</span>
        <span>Configure</span>
      `;
      configureLink.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate('/admin/configure');
      });
      
      // Donors link
      const donorsLink = document.createElement('a');
      donorsLink.href = '/admin/donors';
      donorsLink.className = `admin-sidebar-link ${activePage === 'donors' ? 'active' : ''}`;
      donorsLink.innerHTML = `
        <span>👥</span>
        <span>Donors</span>
      `;
      donorsLink.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate('/admin/donors');
      });
      
      links.appendChild(dashboardLink);
      links.appendChild(uploadLink);
      links.appendChild(configureLink);
      links.appendChild(donorsLink);
      
      sidebar.appendChild(header);
      sidebar.appendChild(links);
      
      return sidebar;
    }
  },
  
  /**
   * Card component
   */
  Card: {
    /**
     * Renders a card
     * @param {Object} options Card options
     * @returns {HTMLElement} Card element
     */
    render(options = {}) {
      const { title, content, footer, className = '' } = options;
      
      const card = document.createElement('div');
      card.className = `bg-background rounded-lg shadow-sm p-6 border border-border ${className}`;
      
      if (title) {
        const titleElement = document.createElement('div');
        titleElement.className = 'mb-4';
        
        if (typeof title === 'string') {
          const titleHeading = document.createElement('h3');
          titleHeading.className = 'text-lg font-semibold';
          titleHeading.textContent = title;
          titleElement.appendChild(titleHeading);
        } else {
          titleElement.appendChild(title);
        }
        
        card.appendChild(titleElement);
      }
      
      if (content) {
        const contentElement = document.createElement('div');
        
        if (typeof content === 'string') {
          contentElement.innerHTML = content;
        } else {
          contentElement.appendChild(content);
        }
        
        card.appendChild(contentElement);
      }
      
      if (footer) {
        const footerElement = document.createElement('div');
        footerElement.className = 'mt-4 pt-4 border-t border-border';
        
        if (typeof footer === 'string') {
          footerElement.innerHTML = footer;
        } else {
          footerElement.appendChild(footer);
        }
        
        card.appendChild(footerElement);
      }
      
      return card;
    }
  },
  
  /**
   * Form component
   */
  Form: {
    /**
     * Creates a form group
     * @param {Object} options Form group options
     * @returns {HTMLElement} Form group element
     */
    createFormGroup(options = {}) {
      const { label, input, error, id } = options;
      
      const formGroup = document.createElement('div');
      formGroup.className = 'mb-4';
      
      if (label) {
        const labelElement = document.createElement('label');
        labelElement.className = 'label';
        labelElement.htmlFor = id;
        labelElement.textContent = label;
        formGroup.appendChild(labelElement);
      }
      
      formGroup.appendChild(input);
      
      if (error) {
        const errorElement = document.createElement('div');
        errorElement.className = 'text-destructive text-sm mt-1';
        errorElement.textContent = error;
        formGroup.appendChild(errorElement);
      }
      
      return formGroup;
    },
    
    /**
     * Creates a text input
     * @param {Object} options Input options
     * @returns {HTMLElement} Input element
     */
    createInput(options = {}) {
      const { type = 'text', id, name, placeholder, value = '', required = false, className = '', onChange } = options;
      
      const input = document.createElement('input');
      input.type = type;
      input.id = id;
      input.name = name || id;
      input.className = `input ${className}`;
      input.value = value;
      
      if (placeholder) {
        input.placeholder = placeholder;
      }
      
      if (required) {
        input.required = true;
      }
      
      if (onChange) {
        input.addEventListener('input', onChange);
      }
      
      return input;
    },
    
    /**
     * Creates a button
     * @param {Object} options Button options
     * @returns {HTMLElement} Button element
     */
    createButton(options = {}) {
      const { text, type = 'button', variant = 'primary', disabled = false, className = '', onClick } = options;
      
      const button = document.createElement('button');
      button.type = type;
      button.className = `btn btn-${variant} ${className}`;
      button.textContent = text;
      
      if (disabled) {
        button.disabled = true;
      }
      
      if (onClick) {
        button.addEventListener('click', onClick);
      }
      
      return button;
    }
  },
  
  /**
   * Stat card component
   */
  StatCard: {
    /**
     * Renders a stat card
     * @param {Object} options Stat card options
     * @returns {HTMLElement} Card element
     */
    render(options = {}) {
      const { title, value, icon, description, change, variant = 'primary' } = options;
      
      const card = document.createElement('div');
      card.className = 'bg-background rounded-lg shadow-sm p-6 border border-border';
      
      const cardHeader = document.createElement('div');
      cardHeader.className = 'flex items-center justify-between mb-4';
      
      const titleElement = document.createElement('h3');
      titleElement.className = 'text-sm font-medium text-muted-foreground';
      titleElement.textContent = title;
      
      const iconElement = document.createElement('div');
      iconElement.className = `p-2 rounded-full bg-${variant}/10 text-${variant}`;
      iconElement.textContent = icon || '📊';
      
      cardHeader.appendChild(titleElement);
      cardHeader.appendChild(iconElement);
      
      const valueElement = document.createElement('div');
      valueElement.className = 'text-2xl font-bold';
      valueElement.textContent = value;
      
      card.appendChild(cardHeader);
      card.appendChild(valueElement);
      
      if (description || change) {
        const cardFooter = document.createElement('div');
        cardFooter.className = 'mt-4 text-sm';
        
        if (description) {
          const descriptionElement = document.createElement('p');
          descriptionElement.className = 'text-muted-foreground';
          descriptionElement.textContent = description;
          cardFooter.appendChild(descriptionElement);
        }
        
        if (change) {
          const changeElement = document.createElement('p');
          const isPositive = change.startsWith('+');
          changeElement.className = `mt-1 ${isPositive ? 'text-success' : 'text-destructive'}`;
          changeElement.textContent = change;
          cardFooter.appendChild(changeElement);
        }
        
        card.appendChild(cardFooter);
      }
      
      return card;
    }
  },
  
  /**
   * Loading indicator component
   */
  LoadingIndicator: {
    /**
     * Renders a loading indicator
     * @param {Object} options Loading indicator options
     * @returns {HTMLElement} Loading indicator element
     */
    render(options = {}) {
      const { text = 'Loading...', size = 'medium' } = options;
      
      const container = document.createElement('div');
      container.className = 'flex flex-col items-center justify-center p-4';
      
      const spinner = document.createElement('div');
      spinner.className = 'loader';
      
      if (size === 'small') {
        spinner.style.width = '1rem';
        spinner.style.height = '1rem';
      } else if (size === 'large') {
        spinner.style.width = '2rem';
        spinner.style.height = '2rem';
      }
      
      if (text) {
        const textElement = document.createElement('p');
        textElement.className = 'text-muted-foreground mt-2';
        textElement.textContent = text;
        container.appendChild(spinner);
        container.appendChild(textElement);
      } else {
        container.appendChild(spinner);
      }
      
      return container;
    }
  },
  
  /**
   * Login form component
   */
  LoginForm: {
    /**
     * Renders the login form
     * @returns {HTMLElement} Form element
     */
    render() {
      const form = document.createElement('form');
      form.id = 'login-form';
      form.className = 'space-y-4';
      
      // Username field
      const usernameInput = Components.Form.createInput({
        id: 'username',
        placeholder: 'Username',
        required: true
      });
      
      const usernameGroup = Components.Form.createFormGroup({
        label: 'Username',
        id: 'username',
        input: usernameInput
      });
      
      // Password field
      const passwordInput = Components.Form.createInput({
        id: 'password',
        type: 'password',
        placeholder: 'Password',
        required: true
      });
      
      const passwordGroup = Components.Form.createFormGroup({
        label: 'Password',
        id: 'password',
        input: passwordInput
      });
      
      // Submit button
      const submitButton = Components.Form.createButton({
        text: 'Log In',
        type: 'submit',
        className: 'w-full mt-4'
      });
      
      form.appendChild(usernameGroup);
      form.appendChild(passwordGroup);
      form.appendChild(submitButton);
      
      // Handle form submission
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username || !password) {
          Toast.error({
            title: 'Validation Error',
            description: 'Please enter both username and password.'
          });
          return;
        }
        
        submitButton.disabled = true;
        submitButton.innerHTML = '<div class="loader mx-auto"></div>';
        
        try {
          await Auth.login(username, password);
          
          Toast.success({
            title: 'Login Successful',
            description: 'Welcome back!'
          });
          
          Router.navigate('/admin');
        } catch (error) {
          console.error('Login error:', error);
          
          Toast.error({
            title: 'Login Failed',
            description: error.message || 'Failed to log in. Please check your credentials and try again.'
          });
          
          submitButton.disabled = false;
          submitButton.textContent = 'Log In';
        }
      });
      
      return form;
    },
    
    /**
     * Initializes the login form
     */
    init() {
      // This method can be used to add additional event listeners
    }
  },
  
  /**
   * Register form component
   */
  RegisterForm: {
    /**
     * Renders the register form
     * @returns {HTMLElement} Form element
     */
    render() {
      const form = document.createElement('form');
      form.id = 'register-form';
      form.className = 'space-y-4';
      
      // Username field
      const usernameInput = Components.Form.createInput({
        id: 'username',
        placeholder: 'Choose a username',
        required: true
      });
      
      const usernameGroup = Components.Form.createFormGroup({
        label: 'Username',
        id: 'username',
        input: usernameInput
      });
      
      // Password field
      const passwordInput = Components.Form.createInput({
        id: 'password',
        type: 'password',
        placeholder: 'Create a password',
        required: true
      });
      
      const passwordGroup = Components.Form.createFormGroup({
        label: 'Password',
        id: 'password',
        input: passwordInput
      });
      
      // Confirm password field
      const confirmPasswordInput = Components.Form.createInput({
        id: 'confirm-password',
        type: 'password',
        placeholder: 'Confirm password',
        required: true
      });
      
      const confirmPasswordGroup = Components.Form.createFormGroup({
        label: 'Confirm Password',
        id: 'confirm-password',
        input: confirmPasswordInput
      });
      
      // Submit button
      const submitButton = Components.Form.createButton({
        text: 'Create Account',
        type: 'submit',
        className: 'w-full mt-4'
      });
      
      form.appendChild(usernameGroup);
      form.appendChild(passwordGroup);
      form.appendChild(confirmPasswordGroup);
      form.appendChild(submitButton);
      
      // Handle form submission
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!username || !password || !confirmPassword) {
          Toast.error({
            title: 'Validation Error',
            description: 'Please fill in all fields.'
          });
          return;
        }
        
        if (password !== confirmPassword) {
          Toast.error({
            title: 'Validation Error',
            description: 'Passwords do not match.'
          });
          return;
        }
        
        submitButton.disabled = true;
        submitButton.innerHTML = '<div class="loader mx-auto"></div>';
        
        try {
          await Auth.register(username, password);
          
          Toast.success({
            title: 'Registration Successful',
            description: 'Your account has been created. Welcome to Impact Wrapped!'
          });
          
          Router.navigate('/admin');
        } catch (error) {
          console.error('Registration error:', error);
          
          Toast.error({
            title: 'Registration Failed',
            description: error.message || 'Failed to create account. Please try again.'
          });
          
          submitButton.disabled = false;
          submitButton.textContent = 'Create Account';
        }
      });
      
      return form;
    },
    
    /**
     * Initializes the register form
     */
    init() {
      // This method can be used to add additional event listeners
    }
  }
};

// Export the Components object
window.Components = Components;