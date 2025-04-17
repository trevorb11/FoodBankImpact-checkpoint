/**
 * UI Components for Impact Wrapped application
 */

const Components = {
  // Navigation bar component
  Navbar: {
    /**
     * Renders the navbar
     * @param {boolean} isAuthenticated Whether user is authenticated
     * @param {Object} user Current user
     * @returns {HTMLElement} Navbar element
     */
    render(isAuthenticated, user) {
      const navbar = document.createElement('header');
      navbar.className = 'relative bg-gradient-to-b from-primary/10 to-background pt-6';
      
      const container = document.createElement('div');
      container.className = 'container px-4 sm:px-6 lg:px-8';
      
      const content = document.createElement('div');
      content.className = 'flex justify-between items-center py-4';
      
      // Logo
      const logoContainer = document.createElement('div');
      logoContainer.className = 'h-12 w-32 cursor-pointer';
      logoContainer.addEventListener('click', () => Router.navigate('/'));
      
      const logo = document.createElement('img');
      logo.src = '/images/impact-wrapped-logo.png';
      logo.alt = 'Impact Wrapped Logo';
      logo.className = 'w-full h-full object-contain';
      
      logoContainer.appendChild(logo);
      content.appendChild(logoContainer);
      
      // Navigation links
      const nav = document.createElement('div');
      nav.className = 'flex gap-4';
      
      if (isAuthenticated) {
        // Dashboard link
        const dashboardBtn = document.createElement('button');
        dashboardBtn.className = 'btn btn-ghost';
        dashboardBtn.textContent = 'Dashboard';
        dashboardBtn.addEventListener('click', () => Router.navigate('/admin'));
        nav.appendChild(dashboardBtn);
        
        // Logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-primary';
        logoutBtn.textContent = 'Logout';
        logoutBtn.addEventListener('click', () => Auth.logout());
        nav.appendChild(logoutBtn);
      } else {
        // Sign in button
        const signInBtn = document.createElement('button');
        signInBtn.className = 'btn btn-ghost';
        signInBtn.textContent = 'Sign In';
        signInBtn.addEventListener('click', () => Router.navigate('/auth/login'));
        nav.appendChild(signInBtn);
        
        // Get started button
        const getStartedBtn = document.createElement('button');
        getStartedBtn.className = 'btn btn-primary';
        getStartedBtn.textContent = 'Get Started';
        getStartedBtn.addEventListener('click', () => Router.navigate('/auth/register'));
        nav.appendChild(getStartedBtn);
      }
      
      content.appendChild(nav);
      container.appendChild(content);
      navbar.appendChild(container);
      
      return navbar;
    }
  },
  
  // Admin sidebar component
  AdminSidebar: {
    /**
     * Renders the admin sidebar
     * @param {string} activeTab Active tab name
     * @returns {HTMLElement} Sidebar element
     */
    render(activeTab = 'dashboard') {
      const sidebar = document.createElement('div');
      sidebar.className = 'bg-muted w-64 p-4 flex flex-col h-full';
      
      // Logo
      const logoContainer = document.createElement('div');
      logoContainer.className = 'h-10 w-auto mb-8';
      
      const logo = document.createElement('img');
      logo.src = '/images/impact-wrapped-logo.png';
      logo.alt = 'Impact Wrapped Logo';
      logo.className = 'h-full w-auto';
      
      logoContainer.appendChild(logo);
      sidebar.appendChild(logoContainer);
      
      // Navigation items
      const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/admin' },
        { id: 'upload', label: 'Upload Donors', icon: 'Upload', path: '/admin/upload-new' },
        { id: 'configure', label: 'Configure', icon: 'Settings', path: '/admin/configure' },
        { id: 'distribute', label: 'Distribute', icon: 'Share2', path: '/admin/distribute' },
        { id: 'preview', label: 'Preview Impact', icon: 'Eye', path: '/admin/preview' }
      ];
      
      const nav = document.createElement('nav');
      nav.className = 'flex flex-col gap-2';
      
      navItems.forEach(item => {
        const navItem = document.createElement('a');
        navItem.className = `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
          activeTab === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/80'
        }`;
        navItem.addEventListener('click', (e) => {
          e.preventDefault();
          Router.navigate(item.path);
        });
        
        // We'll use span instead of the Lucide icon here, in a real implementation you would add proper icon rendering
        const iconSpan = document.createElement('span');
        iconSpan.className = 'w-5 h-5 flex items-center justify-center';
        iconSpan.textContent = item.icon.charAt(0);
        
        const label = document.createElement('span');
        label.textContent = item.label;
        
        navItem.appendChild(iconSpan);
        navItem.appendChild(label);
        nav.appendChild(navItem);
      });
      
      sidebar.appendChild(nav);
      
      // User info at bottom of sidebar
      const userInfo = document.createElement('div');
      userInfo.className = 'mt-auto pt-4 border-t border-border';
      
      const userContainer = document.createElement('div');
      userContainer.className = 'flex items-center gap-3';
      
      const userAvatar = document.createElement('div');
      userAvatar.className = 'w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium';
      userAvatar.textContent = Auth.user?.username.charAt(0).toUpperCase() || 'U';
      
      const userName = document.createElement('div');
      userName.className = 'text-sm font-medium';
      userName.textContent = Auth.user?.username || 'User';
      
      userContainer.appendChild(userAvatar);
      userContainer.appendChild(userName);
      userInfo.appendChild(userContainer);
      
      const logoutButton = document.createElement('button');
      logoutButton.className = 'mt-2 text-xs text-muted-foreground hover:text-foreground';
      logoutButton.textContent = 'Log out';
      logoutButton.addEventListener('click', () => Auth.logout());
      
      userInfo.appendChild(logoutButton);
      sidebar.appendChild(userInfo);
      
      return sidebar;
    }
  },
  
  // Login form component
  LoginForm: {
    /**
     * Initializes login form
     * @param {string} id Form ID
     * @param {HTMLElement} element Form element
     */
    init(id, element) {
      const form = element.querySelector('form');
      if (!form) return;
      
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = form.querySelector('#username').value;
        const password = form.querySelector('#password').value;
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<div class="loader mx-auto"></div>';
        
        const success = await Auth.login(username, password);
        
        if (success) {
          Router.navigate('/admin');
        } else {
          // Reset form on failure
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      });
    },
    
    /**
     * Renders login form
     * @returns {HTMLElement} Form element
     */
    render() {
      const container = document.createElement('div');
      container.className = 'max-w-md w-full mx-auto p-6 bg-background rounded-lg shadow-sm border border-border';
      container.setAttribute('data-component', 'LoginForm');
      
      // Form title
      const title = document.createElement('h1');
      title.className = 'text-2xl font-bold mb-6 text-center';
      title.textContent = 'Sign In';
      
      // Form element
      const form = document.createElement('form');
      form.className = 'space-y-4';
      
      // Username field
      const usernameField = document.createElement('div');
      usernameField.className = 'space-y-2';
      
      const usernameLabel = document.createElement('label');
      usernameLabel.className = 'label';
      usernameLabel.htmlFor = 'username';
      usernameLabel.textContent = 'Username';
      
      const usernameInput = document.createElement('input');
      usernameInput.className = 'input';
      usernameInput.id = 'username';
      usernameInput.type = 'text';
      usernameInput.required = true;
      
      usernameField.appendChild(usernameLabel);
      usernameField.appendChild(usernameInput);
      
      // Password field
      const passwordField = document.createElement('div');
      passwordField.className = 'space-y-2';
      
      const passwordLabel = document.createElement('label');
      passwordLabel.className = 'label';
      passwordLabel.htmlFor = 'password';
      passwordLabel.textContent = 'Password';
      
      const passwordInput = document.createElement('input');
      passwordInput.className = 'input';
      passwordInput.id = 'password';
      passwordInput.type = 'password';
      passwordInput.required = true;
      
      passwordField.appendChild(passwordLabel);
      passwordField.appendChild(passwordInput);
      
      // Submit button
      const submitButton = document.createElement('button');
      submitButton.className = 'btn btn-primary w-full';
      submitButton.type = 'submit';
      submitButton.textContent = 'Sign In';
      
      // Register link
      const registerLink = document.createElement('div');
      registerLink.className = 'text-center text-sm mt-4';
      registerLink.innerHTML = 'Don\'t have an account? <a class="text-primary hover:underline cursor-pointer">Register</a>';
      
      // Add click event to register link
      registerLink.querySelector('a').addEventListener('click', () => {
        Router.navigate('/auth/register');
      });
      
      // Assemble form
      form.appendChild(usernameField);
      form.appendChild(passwordField);
      form.appendChild(submitButton);
      
      // Assemble container
      container.appendChild(title);
      container.appendChild(form);
      container.appendChild(registerLink);
      
      return container;
    }
  },
  
  // Register form component
  RegisterForm: {
    /**
     * Initializes register form
     * @param {string} id Form ID
     * @param {HTMLElement} element Form element
     */
    init(id, element) {
      const form = element.querySelector('form');
      if (!form) return;
      
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = form.querySelector('#username').value;
        const password = form.querySelector('#password').value;
        const confirmPassword = form.querySelector('#confirmPassword').value;
        
        // Check if passwords match
        if (password !== confirmPassword) {
          Toast.show({
            title: 'Registration failed',
            description: 'Passwords do not match',
            variant: 'error'
          });
          return;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<div class="loader mx-auto"></div>';
        
        const success = await Auth.register(username, password);
        
        if (success) {
          Router.navigate('/admin');
        } else {
          // Reset form on failure
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      });
    },
    
    /**
     * Renders register form
     * @returns {HTMLElement} Form element
     */
    render() {
      const container = document.createElement('div');
      container.className = 'max-w-md w-full mx-auto p-6 bg-background rounded-lg shadow-sm border border-border';
      container.setAttribute('data-component', 'RegisterForm');
      
      // Form title
      const title = document.createElement('h1');
      title.className = 'text-2xl font-bold mb-6 text-center';
      title.textContent = 'Create an Account';
      
      // Form element
      const form = document.createElement('form');
      form.className = 'space-y-4';
      
      // Username field
      const usernameField = document.createElement('div');
      usernameField.className = 'space-y-2';
      
      const usernameLabel = document.createElement('label');
      usernameLabel.className = 'label';
      usernameLabel.htmlFor = 'username';
      usernameLabel.textContent = 'Username';
      
      const usernameInput = document.createElement('input');
      usernameInput.className = 'input';
      usernameInput.id = 'username';
      usernameInput.type = 'text';
      usernameInput.required = true;
      
      usernameField.appendChild(usernameLabel);
      usernameField.appendChild(usernameInput);
      
      // Password field
      const passwordField = document.createElement('div');
      passwordField.className = 'space-y-2';
      
      const passwordLabel = document.createElement('label');
      passwordLabel.className = 'label';
      passwordLabel.htmlFor = 'password';
      passwordLabel.textContent = 'Password';
      
      const passwordInput = document.createElement('input');
      passwordInput.className = 'input';
      passwordInput.id = 'password';
      passwordInput.type = 'password';
      passwordInput.required = true;
      
      passwordField.appendChild(passwordLabel);
      passwordField.appendChild(passwordInput);
      
      // Confirm password field
      const confirmPasswordField = document.createElement('div');
      confirmPasswordField.className = 'space-y-2';
      
      const confirmPasswordLabel = document.createElement('label');
      confirmPasswordLabel.className = 'label';
      confirmPasswordLabel.htmlFor = 'confirmPassword';
      confirmPasswordLabel.textContent = 'Confirm Password';
      
      const confirmPasswordInput = document.createElement('input');
      confirmPasswordInput.className = 'input';
      confirmPasswordInput.id = 'confirmPassword';
      confirmPasswordInput.type = 'password';
      confirmPasswordInput.required = true;
      
      confirmPasswordField.appendChild(confirmPasswordLabel);
      confirmPasswordField.appendChild(confirmPasswordInput);
      
      // Submit button
      const submitButton = document.createElement('button');
      submitButton.className = 'btn btn-primary w-full';
      submitButton.type = 'submit';
      submitButton.textContent = 'Create Account';
      
      // Login link
      const loginLink = document.createElement('div');
      loginLink.className = 'text-center text-sm mt-4';
      loginLink.innerHTML = 'Already have an account? <a class="text-primary hover:underline cursor-pointer">Sign In</a>';
      
      // Add click event to login link
      loginLink.querySelector('a').addEventListener('click', () => {
        Router.navigate('/auth/login');
      });
      
      // Assemble form
      form.appendChild(usernameField);
      form.appendChild(passwordField);
      form.appendChild(confirmPasswordField);
      form.appendChild(submitButton);
      
      // Assemble container
      container.appendChild(title);
      container.appendChild(form);
      container.appendChild(loginLink);
      
      return container;
    }
  },
  
  // Footer component
  Footer: {
    /**
     * Renders the footer
     * @returns {HTMLElement} Footer element
     */
    render() {
      const footer = document.createElement('footer');
      footer.className = 'bg-background py-12 mt-auto';
      
      const container = document.createElement('div');
      container.className = 'container px-4 sm:px-6 lg:px-8';
      
      const content = document.createElement('div');
      content.className = 'flex flex-col md:flex-row justify-between items-center';
      
      // Logo section
      const logoSection = document.createElement('div');
      logoSection.className = 'mb-6 md:mb-0';
      
      const logo = document.createElement('img');
      logo.src = '/images/impact-wrapped-logo.png';
      logo.alt = 'Impact Wrapped Logo';
      logo.className = 'h-10 w-auto';
      
      const tagline = document.createElement('p');
      tagline.className = 'text-sm text-muted-foreground mt-2';
      tagline.textContent = 'Visualize Your Food Bank\'s Impact';
      
      logoSection.appendChild(logo);
      logoSection.appendChild(tagline);
      
      // Copyright section
      const copyrightSection = document.createElement('div');
      copyrightSection.className = 'text-sm text-muted-foreground text-center md:text-right';
      
      const copyright = document.createElement('p');
      copyright.textContent = `© ${new Date().getFullYear()} Impact Wrapped for Food Banks. All rights reserved.`;
      
      copyrightSection.appendChild(copyright);
      
      // Assemble content
      content.appendChild(logoSection);
      content.appendChild(copyrightSection);
      
      // Separator
      const separator = document.createElement('div');
      separator.className = 'separator my-8';
      
      // Footer note
      const footerNote = document.createElement('div');
      footerNote.className = 'text-xs text-muted-foreground text-center';
      
      const note = document.createElement('p');
      note.textContent = 'Impact metrics are calculated using industry standard formulas from Feeding America.';
      
      footerNote.appendChild(note);
      
      // Assemble container
      container.appendChild(content);
      container.appendChild(separator);
      container.appendChild(footerNote);
      
      footer.appendChild(container);
      
      return footer;
    }
  },
  
  // Card component
  Card: {
    /**
     * Renders a card
     * @param {Object} props Card properties
     * @returns {HTMLElement} Card element
     */
    render({ title, description, icon, children, className = '' }) {
      const card = document.createElement('div');
      card.className = `card ${className}`;
      
      const header = document.createElement('div');
      header.className = 'card-header';
      
      if (icon) {
        const iconElement = document.createElement('div');
        iconElement.className = 'h-8 w-8 text-primary mb-2 flex items-center justify-center';
        iconElement.textContent = icon.charAt(0); // Placeholder for icon
        header.appendChild(iconElement);
      }
      
      if (title) {
        const titleElement = document.createElement('div');
        titleElement.className = 'card-title';
        titleElement.textContent = title;
        header.appendChild(titleElement);
      }
      
      if (description) {
        const descriptionElement = document.createElement('div');
        descriptionElement.className = 'card-description';
        descriptionElement.textContent = description;
        header.appendChild(descriptionElement);
      }
      
      card.appendChild(header);
      
      if (children) {
        const content = document.createElement('div');
        content.className = 'card-content';
        
        if (typeof children === 'string') {
          content.innerHTML = children;
        } else if (children instanceof Node) {
          content.appendChild(children);
        } else if (Array.isArray(children)) {
          children.forEach(child => {
            if (typeof child === 'string') {
              content.innerHTML += child;
            } else if (child instanceof Node) {
              content.appendChild(child);
            }
          });
        }
        
        card.appendChild(content);
      }
      
      return card;
    }
  }
};

// Export the Components object
window.Components = Components;