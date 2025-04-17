/**
 * Pages for Impact Wrapped application
 */

const Pages = {
  // Landing page
  Landing: {
    /**
     * Renders the landing page
     * @returns {HTMLElement} Page element
     */
    render() {
      const page = document.createElement('div');
      page.className = 'flex flex-col min-h-screen';
      
      // Add navbar
      const authState = {
        isAuthenticated: Auth.isAuthenticated,
        user: Auth.user
      };
      page.appendChild(Components.Navbar.render(authState.isAuthenticated, authState.user));
      
      // Main content
      const mainContent = document.createElement('div');
      
      // Hero section
      const heroSection = document.createElement('section');
      heroSection.className = 'bg-gradient-to-b from-primary/10 to-background pt-12 pb-24';
      
      const heroContainer = document.createElement('div');
      heroContainer.className = 'container px-4 sm:px-6 lg:px-8';
      
      const heroContent = document.createElement('div');
      heroContent.className = 'flex flex-col lg:flex-row items-center gap-8 lg:gap-16';
      
      // Hero text content
      const heroTextContent = document.createElement('div');
      heroTextContent.className = 'flex-1 space-y-6';
      
      const heroTitle = document.createElement('h1');
      heroTitle.className = 'text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight';
      heroTitle.innerHTML = 'Show Donors Their <span class="text-primary">Impact</span>';
      
      const heroDescription = document.createElement('p');
      heroDescription.className = 'text-xl text-muted-foreground max-w-2xl';
      heroDescription.textContent = 'Impact Wrapped helps food banks create personalized impact reports that show donors exactly how their contributions make a difference in the community.';
      
      const heroButtons = document.createElement('div');
      heroButtons.className = 'flex flex-col sm:flex-row gap-4 pt-4';
      
      const getStartedBtn = document.createElement('button');
      getStartedBtn.className = 'btn btn-primary btn-lg';
      getStartedBtn.innerHTML = 'Get Started <span class="ml-2">→</span>';
      getStartedBtn.addEventListener('click', () => {
        if (Auth.isAuthenticated) {
          Router.navigate('/admin');
        } else {
          Router.navigate('/auth/register');
        }
      });
      
      const signInBtn = document.createElement('button');
      signInBtn.className = 'btn btn-outline btn-lg';
      signInBtn.textContent = 'Sign In';
      signInBtn.addEventListener('click', () => {
        Router.navigate('/auth/login');
      });
      
      heroButtons.appendChild(getStartedBtn);
      heroButtons.appendChild(signInBtn);
      
      heroTextContent.appendChild(heroTitle);
      heroTextContent.appendChild(heroDescription);
      heroTextContent.appendChild(heroButtons);
      
      // Hero visual content (impact cards)
      const heroVisualContent = document.createElement('div');
      heroVisualContent.className = 'relative flex-1 min-h-[400px] w-full';
      
      const impactCardsGrid = document.createElement('div');
      impactCardsGrid.className = 'absolute inset-0 grid grid-cols-2 gap-4 p-4';
      
      // Main impact card
      const mainImpactCard = document.createElement('div');
      mainImpactCard.className = 'col-span-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl shadow-lg p-6 flex flex-col justify-between gap-2';
      
      const cardHeader = document.createElement('div');
      cardHeader.className = 'flex flex-col';
      
      const cardTitle = document.createElement('h3');
      cardTitle.className = 'text-xl font-semibold';
      cardTitle.textContent = 'Impact Report';
      
      const cardSubtitle = document.createElement('p');
      cardSubtitle.className = 'text-muted-foreground';
      cardSubtitle.textContent = 'For: John Donor';
      
      cardHeader.appendChild(cardTitle);
      cardHeader.appendChild(cardSubtitle);
      
      const cardStats = document.createElement('div');
      cardStats.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2';
      
      // Stat 1
      const stat1 = document.createElement('div');
      stat1.className = 'space-y-1';
      
      const stat1Label = document.createElement('p');
      stat1Label.className = 'text-muted-foreground text-sm';
      stat1Label.textContent = 'Total Donations';
      
      const stat1Value = document.createElement('p');
      stat1Value.className = 'text-2xl font-bold';
      stat1Value.textContent = '$1,250';
      
      stat1.appendChild(stat1Label);
      stat1.appendChild(stat1Value);
      
      // Stat 2
      const stat2 = document.createElement('div');
      stat2.className = 'space-y-1';
      
      const stat2Label = document.createElement('p');
      stat2Label.className = 'text-muted-foreground text-sm';
      stat2Label.textContent = 'Meals Provided';
      
      const stat2Value = document.createElement('p');
      stat2Value.className = 'text-2xl font-bold';
      stat2Value.textContent = '3,750';
      
      stat2.appendChild(stat2Label);
      stat2.appendChild(stat2Value);
      
      cardStats.appendChild(stat1);
      cardStats.appendChild(stat2);
      
      mainImpactCard.appendChild(cardHeader);
      mainImpactCard.appendChild(cardStats);
      
      // Meals impact card
      const mealsCard = document.createElement('div');
      mealsCard.className = 'bg-gradient-to-br from-blue-500/20 to-primary/5 rounded-xl shadow-lg p-4 flex flex-col justify-between';
      
      const mealsHeader = document.createElement('div');
      mealsHeader.className = 'flex justify-between items-start';
      
      const mealsTitle = document.createElement('h3');
      mealsTitle.className = 'text-lg font-medium';
      mealsTitle.textContent = 'Meals';
      
      const mealsIcon = document.createElement('span');
      mealsIcon.className = 'h-5 w-5 text-blue-500';
      mealsIcon.innerHTML = '📊'; // Placeholder for icon
      
      mealsHeader.appendChild(mealsTitle);
      mealsHeader.appendChild(mealsIcon);
      
      const mealsValue = document.createElement('p');
      mealsValue.className = 'text-3xl font-bold';
      mealsValue.textContent = '3,750';
      
      const mealsDescription = document.createElement('p');
      mealsDescription.className = 'text-sm text-muted-foreground';
      mealsDescription.textContent = 'Provided to families in need';
      
      mealsCard.appendChild(mealsHeader);
      mealsCard.appendChild(mealsValue);
      mealsCard.appendChild(mealsDescription);
      
      // CO2 impact card
      const co2Card = document.createElement('div');
      co2Card.className = 'bg-gradient-to-br from-green-500/20 to-primary/5 rounded-xl shadow-lg p-4 flex flex-col justify-between';
      
      const co2Header = document.createElement('div');
      co2Header.className = 'flex justify-between items-start';
      
      const co2Title = document.createElement('h3');
      co2Title.className = 'text-lg font-medium';
      co2Title.textContent = 'CO₂ Saved';
      
      const co2Icon = document.createElement('span');
      co2Icon.className = 'h-5 w-5 text-green-500';
      co2Icon.innerHTML = '🌍'; // Placeholder for icon
      
      co2Header.appendChild(co2Title);
      co2Header.appendChild(co2Icon);
      
      const co2Value = document.createElement('p');
      co2Value.className = 'text-3xl font-bold';
      co2Value.textContent = '510 kg';
      
      const co2Description = document.createElement('p');
      co2Description.className = 'text-sm text-muted-foreground';
      co2Description.textContent = 'By preventing food waste';
      
      co2Card.appendChild(co2Header);
      co2Card.appendChild(co2Value);
      co2Card.appendChild(co2Description);
      
      // Add all cards to grid
      impactCardsGrid.appendChild(mainImpactCard);
      impactCardsGrid.appendChild(mealsCard);
      impactCardsGrid.appendChild(co2Card);
      
      heroVisualContent.appendChild(impactCardsGrid);
      
      // Assemble hero content
      heroContent.appendChild(heroTextContent);
      heroContent.appendChild(heroVisualContent);
      
      heroContainer.appendChild(heroContent);
      heroSection.appendChild(heroContainer);
      
      // Features section
      const featuresSection = document.createElement('section');
      featuresSection.className = 'py-20 bg-background';
      
      const featuresContainer = document.createElement('div');
      featuresContainer.className = 'container px-4 sm:px-6 lg:px-8';
      
      const featuresHeader = document.createElement('div');
      featuresHeader.className = 'text-center mb-16';
      
      const featuresTitle = document.createElement('h2');
      featuresTitle.className = 'text-3xl font-bold';
      featuresTitle.textContent = 'Why Food Banks Love Impact Wrapped';
      
      const featuresSubtitle = document.createElement('p');
      featuresSubtitle.className = 'text-muted-foreground max-w-2xl mx-auto mt-4';
      featuresSubtitle.textContent = 'Transform donor engagement with personalized impact reports that showcase the real difference they\'re making.';
      
      featuresHeader.appendChild(featuresTitle);
      featuresHeader.appendChild(featuresSubtitle);
      
      const featuresGrid = document.createElement('div');
      featuresGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
      
      // Feature cards
      const featureData = [
        {
          icon: '🎁',
          title: 'Personalized Impact',
          description: 'Show donors exactly how their specific contributions translate into meals, environmental impact, and community support.'
        },
        {
          icon: '👥',
          title: 'Donor Engagement',
          description: 'Increase donor retention with shareable, meaningful content that connects donors to your mission.'
        },
        {
          icon: '📊',
          title: 'Data Visualization',
          description: 'Transform complex donation data into beautiful, easy-to-understand visual reports.'
        },
        {
          icon: '🌍',
          title: 'Environmental Impact',
          description: 'Highlight food waste prevention metrics and the environmental benefits of food bank contributions.'
        },
        {
          icon: '🏆',
          title: 'Donor Recognition',
          description: 'Celebrate individual and collective impact with beautiful, shareable donor recognition.'
        },
        {
          icon: '→',
          title: 'Simple Setup',
          description: 'Upload your donor data and our platform handles the rest, generating custom impact reports automatically.'
        }
      ];
      
      featureData.forEach(feature => {
        const card = Components.Card.render({
          icon: feature.icon,
          title: feature.title,
          description: feature.description
        });
        featuresGrid.appendChild(card);
      });
      
      featuresContainer.appendChild(featuresHeader);
      featuresContainer.appendChild(featuresGrid);
      
      featuresSection.appendChild(featuresContainer);
      
      // How It Works section
      const howItWorksSection = document.createElement('section');
      howItWorksSection.className = 'py-20 bg-muted/30';
      
      const howItWorksContainer = document.createElement('div');
      howItWorksContainer.className = 'container px-4 sm:px-6 lg:px-8';
      
      const howItWorksHeader = document.createElement('div');
      howItWorksHeader.className = 'text-center mb-16';
      
      const howItWorksTitle = document.createElement('h2');
      howItWorksTitle.className = 'text-3xl font-bold';
      howItWorksTitle.textContent = 'How It Works';
      
      const howItWorksSubtitle = document.createElement('p');
      howItWorksSubtitle.className = 'text-muted-foreground max-w-2xl mx-auto mt-4';
      howItWorksSubtitle.textContent = 'Three simple steps to transform your donor engagement strategy';
      
      howItWorksHeader.appendChild(howItWorksTitle);
      howItWorksHeader.appendChild(howItWorksSubtitle);
      
      const stepsGrid = document.createElement('div');
      stepsGrid.className = 'grid grid-cols-1 md:grid-cols-3 gap-8';
      
      // Steps
      const steps = [
        {
          number: 1,
          title: 'Upload Your Data',
          description: 'Simply upload your donor data using our secure CSV importer. We\'ll handle the processing.'
        },
        {
          number: 2,
          title: 'Customize Reports',
          description: 'Personalize impact metrics and branding to match your food bank\'s specific values and mission.'
        },
        {
          number: 3,
          title: 'Share With Donors',
          description: 'Distribute personalized impact reports to your donors and watch engagement soar.'
        }
      ];
      
      steps.forEach(step => {
        const stepContainer = document.createElement('div');
        stepContainer.className = 'flex flex-col items-center text-center';
        
        const stepNumber = document.createElement('div');
        stepNumber.className = 'h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4';
        
        const numberSpan = document.createElement('span');
        numberSpan.className = 'text-xl font-bold text-primary';
        numberSpan.textContent = step.number.toString();
        
        stepNumber.appendChild(numberSpan);
        
        const stepTitle = document.createElement('h3');
        stepTitle.className = 'text-xl font-semibold mb-2';
        stepTitle.textContent = step.title;
        
        const stepDescription = document.createElement('p');
        stepDescription.className = 'text-muted-foreground';
        stepDescription.textContent = step.description;
        
        stepContainer.appendChild(stepNumber);
        stepContainer.appendChild(stepTitle);
        stepContainer.appendChild(stepDescription);
        
        stepsGrid.appendChild(stepContainer);
      });
      
      howItWorksContainer.appendChild(howItWorksHeader);
      howItWorksContainer.appendChild(stepsGrid);
      
      howItWorksSection.appendChild(howItWorksContainer);
      
      // CTA section
      const ctaSection = document.createElement('section');
      ctaSection.className = 'py-16 bg-primary/5';
      
      const ctaContainer = document.createElement('div');
      ctaContainer.className = 'container px-4 sm:px-6 lg:px-8';
      
      const ctaContent = document.createElement('div');
      ctaContent.className = 'max-w-3xl mx-auto text-center space-y-6';
      
      const ctaTitle = document.createElement('h2');
      ctaTitle.className = 'text-3xl font-bold';
      ctaTitle.textContent = 'Ready to Transform Donor Engagement?';
      
      const ctaDescription = document.createElement('p');
      ctaDescription.className = 'text-muted-foreground';
      ctaDescription.textContent = 'Join food banks across the country using Impact Wrapped to create meaningful donor connections and increase giving.';
      
      const ctaButtons = document.createElement('div');
      ctaButtons.className = 'flex flex-col sm:flex-row gap-4 justify-center pt-4';
      
      const ctaGetStartedBtn = document.createElement('button');
      ctaGetStartedBtn.className = 'btn btn-primary btn-lg';
      ctaGetStartedBtn.textContent = 'Get Started Today';
      ctaGetStartedBtn.addEventListener('click', () => {
        if (Auth.isAuthenticated) {
          Router.navigate('/admin');
        } else {
          Router.navigate('/auth/register');
        }
      });
      
      const ctaSignInBtn = document.createElement('button');
      ctaSignInBtn.className = 'btn btn-outline btn-lg';
      ctaSignInBtn.textContent = 'Sign In';
      ctaSignInBtn.addEventListener('click', () => {
        Router.navigate('/auth/login');
      });
      
      ctaButtons.appendChild(ctaGetStartedBtn);
      ctaButtons.appendChild(ctaSignInBtn);
      
      ctaContent.appendChild(ctaTitle);
      ctaContent.appendChild(ctaDescription);
      ctaContent.appendChild(ctaButtons);
      
      ctaContainer.appendChild(ctaContent);
      ctaSection.appendChild(ctaContainer);
      
      // Add all sections to main content
      mainContent.appendChild(heroSection);
      mainContent.appendChild(featuresSection);
      mainContent.appendChild(howItWorksSection);
      mainContent.appendChild(ctaSection);
      
      page.appendChild(mainContent);
      
      // Add footer
      page.appendChild(Components.Footer.render());
      
      return page;
    }
  },
  
  // Login page
  Login: {
    /**
     * Renders the login page
     * @returns {HTMLElement} Page element
     */
    render() {
      const page = document.createElement('div');
      page.className = 'flex flex-col min-h-screen';
      
      // Add navbar
      const authState = {
        isAuthenticated: Auth.isAuthenticated,
        user: Auth.user
      };
      page.appendChild(Components.Navbar.render(authState.isAuthenticated, authState.user));
      
      // Main content
      const mainContent = document.createElement('main');
      mainContent.className = 'flex-1 flex items-center justify-center p-4 bg-muted/30';
      
      // Login form
      mainContent.appendChild(Components.LoginForm.render());
      
      page.appendChild(mainContent);
      
      // Add footer
      page.appendChild(Components.Footer.render());
      
      return page;
    }
  },
  
  // Register page
  Register: {
    /**
     * Renders the register page
     * @returns {HTMLElement} Page element
     */
    render() {
      const page = document.createElement('div');
      page.className = 'flex flex-col min-h-screen';
      
      // Add navbar
      const authState = {
        isAuthenticated: Auth.isAuthenticated,
        user: Auth.user
      };
      page.appendChild(Components.Navbar.render(authState.isAuthenticated, authState.user));
      
      // Main content
      const mainContent = document.createElement('main');
      mainContent.className = 'flex-1 flex items-center justify-center p-4 bg-muted/30';
      
      // Register form
      mainContent.appendChild(Components.RegisterForm.render());
      
      page.appendChild(mainContent);
      
      // Add footer
      page.appendChild(Components.Footer.render());
      
      return page;
    }
  },
  
  // Admin dashboard page
  AdminDashboard: {
    /**
     * Renders the admin dashboard page
     * @returns {HTMLElement} Page element
     */
    render() {
      const page = document.createElement('div');
      page.className = 'flex flex-col min-h-screen';
      
      // Add navbar
      const authState = {
        isAuthenticated: Auth.isAuthenticated,
        user: Auth.user
      };
      page.appendChild(Components.Navbar.render(authState.isAuthenticated, authState.user));
      
      // Main content
      const mainContent = document.createElement('div');
      mainContent.className = 'flex-1 flex bg-muted/30';
      
      // Admin sidebar
      mainContent.appendChild(Components.AdminSidebar.render('dashboard'));
      
      // Dashboard content
      const dashboardContent = document.createElement('div');
      dashboardContent.className = 'flex-1 p-6';
      
      const dashboardHeader = document.createElement('div');
      dashboardHeader.className = 'mb-6';
      
      const dashboardTitle = document.createElement('h1');
      dashboardTitle.className = 'text-2xl font-bold';
      dashboardTitle.textContent = 'Dashboard';
      
      const dashboardDescription = document.createElement('p');
      dashboardDescription.className = 'text-muted-foreground';
      dashboardDescription.textContent = 'Welcome to your Impact Wrapped dashboard.';
      
      dashboardHeader.appendChild(dashboardTitle);
      dashboardHeader.appendChild(dashboardDescription);
      
      // Dashboard stats
      const statsGrid = document.createElement('div');
      statsGrid.className = 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-6';
      
      // Stat cards
      const statData = [
        {
          title: 'Total Donors',
          value: '0',
          description: 'donors in your database'
        },
        {
          title: 'Total Donations',
          value: '$0',
          description: 'processed through the platform'
        },
        {
          title: 'Impact Reports',
          value: '0',
          description: 'shared with donors'
        }
      ];
      
      statData.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'bg-background rounded-lg shadow-sm p-6 border border-border';
        
        const statTitle = document.createElement('h3');
        statTitle.className = 'text-sm font-medium text-muted-foreground';
        statTitle.textContent = stat.title;
        
        const statValue = document.createElement('p');
        statValue.className = 'text-3xl font-bold mt-2';
        statValue.textContent = stat.value;
        
        const statDescription = document.createElement('p');
        statDescription.className = 'text-sm text-muted-foreground mt-1';
        statDescription.textContent = stat.description;
        
        statCard.appendChild(statTitle);
        statCard.appendChild(statValue);
        statCard.appendChild(statDescription);
        
        statsGrid.appendChild(statCard);
      });
      
      // Quick actions
      const quickActions = document.createElement('div');
      quickActions.className = 'bg-background rounded-lg shadow-sm p-6 border border-border';
      
      const quickActionsTitle = document.createElement('h2');
      quickActionsTitle.className = 'text-lg font-semibold mb-4';
      quickActionsTitle.textContent = 'Quick Actions';
      
      const actionsGrid = document.createElement('div');
      actionsGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
      
      // Action cards
      const actions = [
        {
          title: 'Upload Donors',
          description: 'Import your donor list via CSV file',
          button: 'Upload',
          icon: '⬆️',
          path: '/admin/upload-new'
        },
        {
          title: 'Configure Food Bank',
          description: 'Set up your organization details and impact metrics',
          button: 'Configure',
          icon: '⚙️',
          path: '/admin/configure'
        }
      ];
      
      actions.forEach(action => {
        const actionCard = document.createElement('div');
        actionCard.className = 'bg-muted/30 rounded-lg p-4 flex items-start gap-4';
        
        const actionIcon = document.createElement('div');
        actionIcon.className = 'w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary';
        actionIcon.innerHTML = action.icon;
        
        const actionContent = document.createElement('div');
        actionContent.className = 'flex-1';
        
        const actionTitle = document.createElement('h3');
        actionTitle.className = 'font-medium';
        actionTitle.textContent = action.title;
        
        const actionDescription = document.createElement('p');
        actionDescription.className = 'text-sm text-muted-foreground mt-1';
        actionDescription.textContent = action.description;
        
        const actionButton = document.createElement('button');
        actionButton.className = 'btn btn-primary mt-3 w-full';
        actionButton.textContent = action.button;
        actionButton.addEventListener('click', () => {
          Router.navigate(action.path);
        });
        
        actionContent.appendChild(actionTitle);
        actionContent.appendChild(actionDescription);
        actionContent.appendChild(actionButton);
        
        actionCard.appendChild(actionIcon);
        actionCard.appendChild(actionContent);
        
        actionsGrid.appendChild(actionCard);
      });
      
      quickActions.appendChild(quickActionsTitle);
      quickActions.appendChild(actionsGrid);
      
      // Getting started
      const gettingStarted = document.createElement('div');
      gettingStarted.className = 'bg-background rounded-lg shadow-sm p-6 border border-border mt-6';
      
      const gettingStartedTitle = document.createElement('h2');
      gettingStartedTitle.className = 'text-lg font-semibold mb-4';
      gettingStartedTitle.textContent = 'Getting Started';
      
      const steps = document.createElement('ol');
      steps.className = 'space-y-4 ml-6 list-decimal';
      
      const stepItems = [
        'Configure your food bank profile and impact metrics',
        'Upload your donor data via CSV file',
        'Preview and customize your donor impact reports',
        'Share personalized impact URLs with your donors'
      ];
      
      stepItems.forEach(item => {
        const stepItem = document.createElement('li');
        stepItem.className = 'text-muted-foreground';
        stepItem.textContent = item;
        steps.appendChild(stepItem);
      });
      
      gettingStarted.appendChild(gettingStartedTitle);
      gettingStarted.appendChild(steps);
      
      // Assemble dashboard content
      dashboardContent.appendChild(dashboardHeader);
      dashboardContent.appendChild(statsGrid);
      dashboardContent.appendChild(quickActions);
      dashboardContent.appendChild(gettingStarted);
      
      mainContent.appendChild(dashboardContent);
      
      page.appendChild(mainContent);
      
      return page;
    }
  },
  
  // Not found page
  NotFound: {
    /**
     * Renders the not found page
     * @returns {HTMLElement} Page element
     */
    render() {
      const page = document.createElement('div');
      page.className = 'flex flex-col min-h-screen';
      
      // Add navbar
      const authState = {
        isAuthenticated: Auth.isAuthenticated,
        user: Auth.user
      };
      page.appendChild(Components.Navbar.render(authState.isAuthenticated, authState.user));
      
      // Main content
      const mainContent = document.createElement('main');
      mainContent.className = 'flex-1 flex items-center justify-center p-4 bg-muted/30';
      
      const notFoundContainer = document.createElement('div');
      notFoundContainer.className = 'text-center max-w-md';
      
      const notFoundTitle = document.createElement('h1');
      notFoundTitle.className = 'text-6xl font-bold text-primary mb-4';
      notFoundTitle.textContent = '404';
      
      const notFoundMessage = document.createElement('h2');
      notFoundMessage.className = 'text-2xl font-semibold mb-4';
      notFoundMessage.textContent = 'Page Not Found';
      
      const notFoundDescription = document.createElement('p');
      notFoundDescription.className = 'text-muted-foreground mb-6';
      notFoundDescription.textContent = 'The page you are looking for doesn\'t exist or has been moved.';
      
      const homeButton = document.createElement('button');
      homeButton.className = 'btn btn-primary';
      homeButton.textContent = 'Go Home';
      homeButton.addEventListener('click', () => {
        Router.navigate('/');
      });
      
      notFoundContainer.appendChild(notFoundTitle);
      notFoundContainer.appendChild(notFoundMessage);
      notFoundContainer.appendChild(notFoundDescription);
      notFoundContainer.appendChild(homeButton);
      
      mainContent.appendChild(notFoundContainer);
      
      page.appendChild(mainContent);
      
      // Add footer
      page.appendChild(Components.Footer.render());
      
      return page;
    }
  }
};

// Export the Pages object
window.Pages = Pages;