/**
 * Admin pages for Impact Wrapped application
 */

/**
 * Parses CSV data into an array of donor objects
 * @param {string} csvData CSV data as string
 * @returns {Array} Array of donor objects
 */
function parseCSV(csvData) {
  // Split the CSV into lines
  const lines = csvData.split(/\r?\n/);
  
  // Extract headers (first line)
  const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
  
  // Map column names to standardized property names
  const columnMap = {
    'email': 'email',
    'firstname': 'first_name',
    'first name': 'first_name',
    'first_name': 'first_name',
    'lastname': 'last_name',
    'last name': 'last_name',
    'last_name': 'last_name',
    'donationamount': 'total_giving',
    'donation amount': 'total_giving',
    'donation_amount': 'total_giving',
    'totalgiving': 'total_giving',
    'total giving': 'total_giving',
    'total_giving': 'total_giving',
    'amount': 'total_giving'
  };
  
  // Initialize donors array
  const donors = [];
  
  // Process data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    // Skip empty lines
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(value => value.trim());
    
    // Create donor object
    const donor = {};
    
    // Map values to properties
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      const standardizedProperty = columnMap[header] || header;
      
      // Handle special case for total_giving (convert to number)
      if (standardizedProperty === 'total_giving') {
        donor[standardizedProperty] = parseFloat(values[j]) || 0;
      } else {
        donor[standardizedProperty] = values[j];
      }
    }
    
    // Add to donors array if it has required fields
    if (donor.email && donor.first_name && donor.last_name && donor.total_giving) {
      donors.push(donor);
    }
  }
  
  return donors;
}

/**
 * Validates donor data
 * @param {Array} donors Array of donor objects
 * @returns {Object} Validation result with valid flag and error message
 */
function validateDonors(donors) {
  if (!donors || donors.length === 0) {
    return {
      valid: false,
      error: 'No valid donor records found in the file. Please check the format.'
    };
  }
  
  // Check for required fields in each donor
  for (let i = 0; i < donors.length; i++) {
    const donor = donors[i];
    if (!donor.email) {
      return {
        valid: false,
        error: `Row ${i + 1}: Missing email address`
      };
    }
    
    if (!donor.first_name) {
      return {
        valid: false,
        error: `Row ${i + 1}: Missing first name`
      };
    }
    
    if (!donor.last_name) {
      return {
        valid: false,
        error: `Row ${i + 1}: Missing last name`
      };
    }
    
    if (typeof donor.total_giving !== 'number' || isNaN(donor.total_giving)) {
      return {
        valid: false,
        error: `Row ${i + 1}: Invalid donation amount. Must be a number.`
      };
    }
  }
  
  return {
    valid: true
  };
}

const AdminPages = {
  // Admin upload page
  UploadPage: {
    /**
     * Renders the admin upload page
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
      mainContent.appendChild(Components.AdminSidebar.render('upload'));
      
      // Upload content
      const uploadContent = document.createElement('div');
      uploadContent.className = 'flex-1 p-6';
      
      const uploadHeader = document.createElement('div');
      uploadHeader.className = 'mb-6';
      
      const uploadTitle = document.createElement('h1');
      uploadTitle.className = 'text-2xl font-bold';
      uploadTitle.textContent = 'Upload Donor Data';
      
      const uploadDescription = document.createElement('p');
      uploadDescription.className = 'text-muted-foreground';
      uploadDescription.textContent = 'Import your donor data to generate personalized impact reports.';
      
      uploadHeader.appendChild(uploadTitle);
      uploadHeader.appendChild(uploadDescription);
      
      // Upload form
      const uploadForm = document.createElement('div');
      uploadForm.className = 'bg-background rounded-lg shadow-sm p-6 border border-border max-w-3xl';
      uploadForm.setAttribute('data-component', 'UploadForm');
      uploadForm.id = 'upload-form';
      
      const uploadFormHeader = document.createElement('div');
      uploadFormHeader.className = 'mb-4';
      
      const formTitle = document.createElement('h2');
      formTitle.className = 'text-lg font-semibold';
      formTitle.textContent = 'Donor Data Import';
      
      const formDescription = document.createElement('p');
      formDescription.className = 'text-sm text-muted-foreground mt-1';
      formDescription.textContent = 'Upload a CSV file containing your donor data. Required columns: email, firstName, lastName, donationAmount.';
      
      const duplicateNote = document.createElement('p');
      duplicateNote.className = 'text-xs text-muted-foreground mt-1 italic';
      duplicateNote.textContent = 'Note: Duplicate email addresses will be automatically updated rather than causing errors.';
      
      uploadFormHeader.appendChild(formTitle);
      uploadFormHeader.appendChild(formDescription);
      uploadFormHeader.appendChild(duplicateNote);
      
      // File upload dropzone
      const dropzone = document.createElement('div');
      dropzone.className = 'border-2 border-dashed border-primary/20 rounded-lg p-8 text-center bg-primary/5 mb-4 cursor-pointer hover:bg-primary/10 transition-colors';
      
      const dropzoneIcon = document.createElement('div');
      dropzoneIcon.className = 'mb-4';
      dropzoneIcon.innerHTML = '⬆️'; // Placeholder for icon
      
      const dropzoneText = document.createElement('p');
      dropzoneText.className = 'text-sm text-muted-foreground mb-2';
      dropzoneText.textContent = 'Drag and drop your CSV file here, or click to browse';
      
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'csv-file';
      fileInput.name = 'csv-file';
      fileInput.accept = '.csv';
      fileInput.className = 'hidden';
      
      const dropzoneButton = document.createElement('button');
      dropzoneButton.className = 'btn btn-outline text-sm';
      dropzoneButton.textContent = 'Browse Files';
      dropzoneButton.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
      });
      
      dropzone.appendChild(dropzoneIcon);
      dropzone.appendChild(dropzoneText);
      dropzone.appendChild(dropzoneButton);
      dropzone.appendChild(fileInput);
      
      // File selected info
      const fileInfo = document.createElement('div');
      fileInfo.className = 'hidden mb-4 p-3 bg-muted rounded-lg';
      fileInfo.id = 'file-info';
      
      // Upload button
      const uploadButton = document.createElement('button');
      uploadButton.className = 'btn btn-primary w-full';
      uploadButton.textContent = 'Upload and Process Donor Data';
      uploadButton.disabled = true;
      uploadButton.id = 'upload-button';
      
      // Assemble form
      uploadForm.appendChild(uploadFormHeader);
      uploadForm.appendChild(dropzone);
      uploadForm.appendChild(fileInfo);
      uploadForm.appendChild(uploadButton);
      
      // CSV format help
      const csvHelp = document.createElement('div');
      csvHelp.className = 'mt-6 bg-background rounded-lg shadow-sm p-6 border border-border max-w-3xl';
      
      const csvHelpTitle = document.createElement('h2');
      csvHelpTitle.className = 'text-lg font-semibold mb-4';
      csvHelpTitle.textContent = 'CSV Format Guide';
      
      const requiredColumnsTitle = document.createElement('h3');
      requiredColumnsTitle.className = 'text-sm font-medium mb-2';
      requiredColumnsTitle.textContent = 'Required Columns:';
      
      const requiredColumnsList = document.createElement('ul');
      requiredColumnsList.className = 'list-disc pl-5 mb-4 space-y-1 text-sm text-muted-foreground';
      
      const requiredColumns = [
        'email - Donor email address (duplicates will be updated automatically)',
        'firstName - Donor first name',
        'lastName - Donor last name',
        'donationAmount - Total donation amount in dollars'
      ];
      
      requiredColumns.forEach(column => {
        const li = document.createElement('li');
        li.textContent = column;
        requiredColumnsList.appendChild(li);
      });
      
      const optionalColumnsTitle = document.createElement('h3');
      optionalColumnsTitle.className = 'text-sm font-medium mb-2';
      optionalColumnsTitle.textContent = 'Optional Columns:';
      
      const optionalColumnsList = document.createElement('ul');
      optionalColumnsList.className = 'list-disc pl-5 mb-4 space-y-1 text-sm text-muted-foreground';
      
      const optionalColumns = [
        'donationDate - Date of donation (YYYY-MM-DD format)',
        'donationType - Type of donation (one-time, recurring)',
        'anonymous - Whether donor is anonymous (true/false)',
        'notes - Additional notes about the donor'
      ];
      
      optionalColumns.forEach(column => {
        const li = document.createElement('li');
        li.textContent = column;
        optionalColumnsList.appendChild(li);
      });
      
      const csvExample = document.createElement('div');
      csvExample.className = 'bg-muted p-3 rounded-md overflow-x-auto text-sm font-mono';
      csvExample.innerHTML = 'email,firstName,lastName,donationAmount,donationDate,donationType<br>john@example.com,John,Doe,250,2023-01-15,one-time<br>jane@example.com,Jane,Smith,500,2023-02-20,recurring<br>john@example.com,John,Doe,300,2023-03-10,one-time<br>';
      
      // Add a note about duplicate handling
      const duplicatesNote = document.createElement('div');
      duplicatesNote.className = 'bg-blue-50 p-3 rounded-md my-4 text-xs text-blue-700';
      duplicatesNote.innerHTML = '<strong>Note about duplicates:</strong> In the example above, the same email (john@example.com) appears twice. The system will handle this by updating the donor\'s information with the latest values. The first record creates the donor, and the second record updates their donation amount to 300.';
      
      csvHelp.appendChild(csvHelpTitle);
      csvHelp.appendChild(requiredColumnsTitle);
      csvHelp.appendChild(requiredColumnsList);
      csvHelp.appendChild(optionalColumnsTitle);
      csvHelp.appendChild(optionalColumnsList);
      csvHelp.appendChild(csvExample);
      csvHelp.appendChild(duplicatesNote);
      
      // Assemble upload content
      uploadContent.appendChild(uploadHeader);
      uploadContent.appendChild(uploadForm);
      uploadContent.appendChild(csvHelp);
      
      mainContent.appendChild(uploadContent);
      
      page.appendChild(mainContent);
      
      return page;
    },
    
    /**
     * Initializes the upload page
     */
    init() {
      const uploadForm = document.getElementById('upload-form');
      if (!uploadForm) return;
      
      const fileInput = document.getElementById('csv-file');
      const fileInfo = document.getElementById('file-info');
      const uploadButton = document.getElementById('upload-button');
      const dropzone = uploadForm.querySelector('.border-dashed');
      
      // Handle file selection
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.name.endsWith('.csv')) {
          // Show file info
          fileInfo.innerHTML = `
            <div class="flex items-center gap-2">
              <div>📄</div>
              <div>
                <p class="font-medium">${file.name}</p>
                <p class="text-xs text-muted-foreground">${(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <button class="ml-auto text-muted-foreground hover:text-foreground">&times;</button>
            </div>
          `;
          fileInfo.classList.remove('hidden');
          
          // Enable upload button
          uploadButton.disabled = false;
          
          // Add remove file handler
          const removeButton = fileInfo.querySelector('button');
          removeButton.addEventListener('click', () => {
            fileInput.value = '';
            fileInfo.classList.add('hidden');
            uploadButton.disabled = true;
          });
        }
      });
      
      // Handle drag and drop
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-primary');
      });
      
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-primary');
      });
      
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-primary');
        
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
          // Update file input
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
          
          // Show file info
          fileInfo.innerHTML = `
            <div class="flex items-center gap-2">
              <div>📄</div>
              <div>
                <p class="font-medium">${file.name}</p>
                <p class="text-xs text-muted-foreground">${(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <button class="ml-auto text-muted-foreground hover:text-foreground">&times;</button>
            </div>
          `;
          fileInfo.classList.remove('hidden');
          
          // Enable upload button
          uploadButton.disabled = false;
          
          // Add remove file handler
          const removeButton = fileInfo.querySelector('button');
          removeButton.addEventListener('click', () => {
            fileInput.value = '';
            fileInfo.classList.add('hidden');
            uploadButton.disabled = true;
          });
        }
      });
      
      // Handle upload
      uploadButton.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) return;
        
        // Show loading state
        uploadButton.disabled = true;
        uploadButton.innerHTML = '<div class="loader mx-auto"></div>';
        
        try {
          // Read the CSV file
          const reader = new FileReader();
          reader.onload = async function(event) {
            const csvData = event.target.result;
            
            // Parse CSV into array of donor objects
            const donors = parseCSV(csvData);
            
            // Validate donor data
            const validationResult = validateDonors(donors);
            if (!validationResult.valid) {
              Toast.show({
                title: 'Validation Error',
                description: validationResult.error,
                variant: 'destructive'
              });
              
              // Reset button
              uploadButton.textContent = 'Upload and Process Donor Data';
              uploadButton.disabled = false;
              return;
            }
            
            try {
              // Upload to server - now with proper duplicate handling
              const uploadData = {
                fileName: file.name,
                description: 'Uploaded donor data',
                donors: donors
              };
              
              const response = await API.donors.uploadDonors(uploadData);
              
              // Show success message with details about new/updated donors
              Toast.show({
                title: 'Upload Complete',
                description: `${response.message}`,
                variant: 'success'
              });
              
              // Reset form
              fileInput.value = '';
              fileInfo.classList.add('hidden');
              uploadButton.textContent = 'Upload and Process Donor Data';
              uploadButton.disabled = true;
              
              // Navigate to dashboard
              Router.navigate('/admin');
            } catch (error) {
              Toast.show({
                title: 'Upload Error',
                description: error.message || 'Failed to upload donor data',
                variant: 'destructive'
              });
              
              // Reset button
              uploadButton.textContent = 'Upload and Process Donor Data';
              uploadButton.disabled = false;
            }
          };
          
          reader.onerror = function() {
            Toast.show({
              title: 'File Error',
              description: 'Failed to read CSV file',
              variant: 'destructive'
            });
            
            // Reset button
            uploadButton.textContent = 'Upload and Process Donor Data';
            uploadButton.disabled = false;
          };
          
          reader.readAsText(file);
        } catch (error) {
          Toast.show({
            title: 'Error',
            description: error.message || 'An unexpected error occurred',
            variant: 'destructive'
          });
          
          // Reset button
          uploadButton.textContent = 'Upload and Process Donor Data';
          uploadButton.disabled = false;
        }
      });
    }
  },
  
  // Admin configure page
  ConfigurePage: {
    /**
     * Renders the admin configure page
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
      mainContent.appendChild(Components.AdminSidebar.render('configure'));
      
      // Configure content
      const configureContent = document.createElement('div');
      configureContent.className = 'flex-1 p-6';
      
      const configureHeader = document.createElement('div');
      configureHeader.className = 'mb-6';
      
      const configureTitle = document.createElement('h1');
      configureTitle.className = 'text-2xl font-bold';
      configureTitle.textContent = 'Configure Food Bank';
      
      const configureDescription = document.createElement('p');
      configureDescription.className = 'text-muted-foreground';
      configureDescription.textContent = 'Set up your food bank profile and customize impact metrics.';
      
      configureHeader.appendChild(configureTitle);
      configureHeader.appendChild(configureDescription);
      
      // Configuration form
      const configForm = document.createElement('div');
      configForm.className = 'grid grid-cols-1 md:grid-cols-2 gap-6';
      
      // Food bank profile card
      const profileCard = document.createElement('div');
      profileCard.className = 'bg-background rounded-lg shadow-sm p-6 border border-border';
      
      const profileTitle = document.createElement('h2');
      profileTitle.className = 'text-lg font-semibold mb-4';
      profileTitle.textContent = 'Food Bank Profile';
      
      const nameField = document.createElement('div');
      nameField.className = 'mb-4';
      
      const nameLabel = document.createElement('label');
      nameLabel.className = 'label';
      nameLabel.htmlFor = 'food-bank-name';
      nameLabel.textContent = 'Food Bank Name';
      
      const nameInput = document.createElement('input');
      nameInput.className = 'input';
      nameInput.id = 'food-bank-name';
      nameInput.type = 'text';
      nameInput.placeholder = 'Community Food Bank';
      
      nameField.appendChild(nameLabel);
      nameField.appendChild(nameInput);
      
      const logoField = document.createElement('div');
      logoField.className = 'mb-4';
      
      const logoLabel = document.createElement('label');
      logoLabel.className = 'label';
      logoLabel.htmlFor = 'food-bank-logo';
      logoLabel.textContent = 'Logo URL';
      
      const logoInput = document.createElement('input');
      logoInput.className = 'input';
      logoInput.id = 'food-bank-logo';
      logoInput.type = 'text';
      logoInput.placeholder = 'https://example.com/logo.png';
      
      logoField.appendChild(logoLabel);
      logoField.appendChild(logoInput);
      
      const primaryColorField = document.createElement('div');
      primaryColorField.className = 'mb-4';
      
      const primaryColorLabel = document.createElement('label');
      primaryColorLabel.className = 'label';
      primaryColorLabel.htmlFor = 'primary-color';
      primaryColorLabel.textContent = 'Primary Color';
      
      const primaryColorInput = document.createElement('input');
      primaryColorInput.className = 'input w-full';
      primaryColorInput.id = 'primary-color';
      primaryColorInput.type = 'color';
      primaryColorInput.value = '#0ea5e9';
      
      primaryColorField.appendChild(primaryColorLabel);
      primaryColorField.appendChild(primaryColorInput);
      
      const secondaryColorField = document.createElement('div');
      secondaryColorField.className = 'mb-4';
      
      const secondaryColorLabel = document.createElement('label');
      secondaryColorLabel.className = 'label';
      secondaryColorLabel.htmlFor = 'secondary-color';
      secondaryColorLabel.textContent = 'Secondary Color';
      
      const secondaryColorInput = document.createElement('input');
      secondaryColorInput.className = 'input w-full';
      secondaryColorInput.id = 'secondary-color';
      secondaryColorInput.type = 'color';
      secondaryColorInput.value = '#22c55e';
      
      secondaryColorField.appendChild(secondaryColorLabel);
      secondaryColorField.appendChild(secondaryColorInput);
      
      const thankYouField = document.createElement('div');
      thankYouField.className = 'mb-4';
      
      const thankYouLabel = document.createElement('label');
      thankYouLabel.className = 'label';
      thankYouLabel.htmlFor = 'thank-you-message';
      thankYouLabel.textContent = 'Thank You Message';
      
      const thankYouTextarea = document.createElement('textarea');
      thankYouTextarea.className = 'input min-h-[100px]';
      thankYouTextarea.id = 'thank-you-message';
      thankYouTextarea.placeholder = 'Thank you for your generous support!';
      thankYouTextarea.value = 'Thank you for your generous support! Your contributions make a meaningful difference in our community.';
      
      thankYouField.appendChild(thankYouLabel);
      thankYouField.appendChild(thankYouTextarea);
      
      profileCard.appendChild(profileTitle);
      profileCard.appendChild(nameField);
      profileCard.appendChild(logoField);
      profileCard.appendChild(primaryColorField);
      profileCard.appendChild(secondaryColorField);
      profileCard.appendChild(thankYouField);
      
      // Impact metrics card
      const metricsCard = document.createElement('div');
      metricsCard.className = 'bg-background rounded-lg shadow-sm p-6 border border-border';
      
      const metricsTitle = document.createElement('h2');
      metricsTitle.className = 'text-lg font-semibold mb-4';
      metricsTitle.textContent = 'Impact Metrics';
      
      const metricsDescription = document.createElement('p');
      metricsDescription.className = 'text-sm text-muted-foreground mb-4';
      metricsDescription.textContent = 'Customize how donation amounts are converted to impact metrics. Default values are based on Feeding America standards.';
      
      // Metrics fields
      const dollarsPerMealField = document.createElement('div');
      dollarsPerMealField.className = 'mb-4';
      
      const dollarsPerMealLabel = document.createElement('label');
      dollarsPerMealLabel.className = 'label';
      dollarsPerMealLabel.htmlFor = 'dollars-per-meal';
      dollarsPerMealLabel.textContent = 'Dollars Per Meal';
      
      const dollarsPerMealInput = document.createElement('input');
      dollarsPerMealInput.className = 'input';
      dollarsPerMealInput.id = 'dollars-per-meal';
      dollarsPerMealInput.type = 'number';
      dollarsPerMealInput.step = '0.01';
      dollarsPerMealInput.value = '0.20';
      
      dollarsPerMealField.appendChild(dollarsPerMealLabel);
      dollarsPerMealField.appendChild(dollarsPerMealInput);
      
      const mealsPerPersonField = document.createElement('div');
      mealsPerPersonField.className = 'mb-4';
      
      const mealsPerPersonLabel = document.createElement('label');
      mealsPerPersonLabel.className = 'label';
      mealsPerPersonLabel.htmlFor = 'meals-per-person';
      mealsPerPersonLabel.textContent = 'Meals Per Person (daily)';
      
      const mealsPerPersonInput = document.createElement('input');
      mealsPerPersonInput.className = 'input';
      mealsPerPersonInput.id = 'meals-per-person';
      mealsPerPersonInput.type = 'number';
      mealsPerPersonInput.step = '0.1';
      mealsPerPersonInput.value = '3';
      
      mealsPerPersonField.appendChild(mealsPerPersonLabel);
      mealsPerPersonField.appendChild(mealsPerPersonInput);
      
      const poundsPerMealField = document.createElement('div');
      poundsPerMealField.className = 'mb-4';
      
      const poundsPerMealLabel = document.createElement('label');
      poundsPerMealLabel.className = 'label';
      poundsPerMealLabel.htmlFor = 'pounds-per-meal';
      poundsPerMealLabel.textContent = 'Pounds Per Meal';
      
      const poundsPerMealInput = document.createElement('input');
      poundsPerMealInput.className = 'input';
      poundsPerMealInput.id = 'pounds-per-meal';
      poundsPerMealInput.type = 'number';
      poundsPerMealInput.step = '0.1';
      poundsPerMealInput.value = '1.2';
      
      poundsPerMealField.appendChild(poundsPerMealLabel);
      poundsPerMealField.appendChild(poundsPerMealInput);
      
      const co2PerPoundField = document.createElement('div');
      co2PerPoundField.className = 'mb-4';
      
      const co2PerPoundLabel = document.createElement('label');
      co2PerPoundLabel.className = 'label';
      co2PerPoundLabel.htmlFor = 'co2-per-pound';
      co2PerPoundLabel.textContent = 'CO₂ Saved Per Pound (kg)';
      
      const co2PerPoundInput = document.createElement('input');
      co2PerPoundInput.className = 'input';
      co2PerPoundInput.id = 'co2-per-pound';
      co2PerPoundInput.type = 'number';
      co2PerPoundInput.step = '0.1';
      co2PerPoundInput.value = '2.5';
      
      co2PerPoundField.appendChild(co2PerPoundLabel);
      co2PerPoundField.appendChild(co2PerPoundInput);
      
      const waterPerPoundField = document.createElement('div');
      waterPerPoundField.className = 'mb-4';
      
      const waterPerPoundLabel = document.createElement('label');
      waterPerPoundLabel.className = 'label';
      waterPerPoundLabel.htmlFor = 'water-per-pound';
      waterPerPoundLabel.textContent = 'Water Saved Per Pound (gallons)';
      
      const waterPerPoundInput = document.createElement('input');
      waterPerPoundInput.className = 'input';
      waterPerPoundInput.id = 'water-per-pound';
      waterPerPoundInput.type = 'number';
      waterPerPoundInput.step = '0.1';
      waterPerPoundInput.value = '108';
      
      waterPerPoundField.appendChild(waterPerPoundLabel);
      waterPerPoundField.appendChild(waterPerPoundInput);
      
      metricsCard.appendChild(metricsTitle);
      metricsCard.appendChild(metricsDescription);
      metricsCard.appendChild(dollarsPerMealField);
      metricsCard.appendChild(mealsPerPersonField);
      metricsCard.appendChild(poundsPerMealField);
      metricsCard.appendChild(co2PerPoundField);
      metricsCard.appendChild(waterPerPoundField);
      
      // Save button
      const saveButton = document.createElement('button');
      saveButton.className = 'btn btn-primary mt-4';
      saveButton.textContent = 'Save Configuration';
      saveButton.addEventListener('click', () => {
        Toast.show({
          title: 'Configuration Saved',
          description: 'Your food bank configuration has been updated.',
          variant: 'success'
        });
      });
      
      // Assemble config form
      configForm.appendChild(profileCard);
      configForm.appendChild(metricsCard);
      
      // Assemble configure content
      configureContent.appendChild(configureHeader);
      configureContent.appendChild(configForm);
      configureContent.appendChild(saveButton);
      
      mainContent.appendChild(configureContent);
      
      page.appendChild(mainContent);
      
      return page;
    }
  }
};

// Add admin pages to the Pages object
window.AdminPages = AdminPages;