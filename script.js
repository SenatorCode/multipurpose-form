// Form state management
let currentStep = 1;
const formData = {};

// Initialize form on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFormData();
    attachEventListeners();
    updateProgressBar();
});

// Attach event listeners
function attachEventListeners() {
    // Next buttons
    document.querySelectorAll('.btn-next').forEach(button => {
        button.addEventListener('click', function() {
            const nextStep = parseInt(this.dataset.next);
            if (validateStep(currentStep)) {
                saveStepData(currentStep);
                goToStep(nextStep);
            }
        });
    });

    // Previous buttons
    document.querySelectorAll('.btn-prev').forEach(button => {
        button.addEventListener('click', function() {
            const prevStep = parseInt(this.dataset.prev);
            saveStepData(currentStep);
            goToStep(prevStep);
        });
    });

    // Form submission
    document.getElementById('admissionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateStep(currentStep)) {
            saveStepData(currentStep);
            submitForm();
        }
    });

    // Real-time input validation
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            saveFieldData(this);
        });
    });
}

// Navigate to specific step
function goToStep(stepNumber) {
    // Hide current step
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });

    // Show target step
    const targetStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (targetStep) {
        targetStep.classList.add('active');
        currentStep = stepNumber;
        updateProgressBar();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Update progress bar
function updateProgressBar() {
    document.querySelectorAll('.progress-step').forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        
        if (stepNum < currentStep) {
            step.classList.add('completed');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
        }
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    const fieldType = field.type;
    let isValid = true;
    let errorMessage = '';

    // Clear previous error
    field.classList.remove('invalid');
    const errorElement = field.parentElement.querySelector('.error-message');
    errorElement.textContent = '';

    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    // Validate text fields (names, relationships)
    else if ((fieldType === 'text' && (fieldName.includes('Name') || fieldName === 'kinRelationship')) && value) {
        if (!/^[a-zA-Z\s'-]+$/.test(value)) {
            isValid = false;
            errorMessage = 'Only letters, spaces, hyphens, and apostrophes are allowed';
        }
    }
    // Validate email
    else if (fieldType === 'email' && value) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    // Validate phone number
    else if (fieldName.includes('Phone') && value) {
        if (!/^[\d\s\-\+\(\)]+$/.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
        if (value.replace(/\D/g, '').length < 10) {
            isValid = false;
            errorMessage = 'Phone number must be at least 10 digits';
        }
    }
    // Validate graduation year
    else if (fieldName === 'graduationYear' && value) {
        const year = parseInt(value);
        if (year < 1950 || year > 2025) {
            isValid = false;
            errorMessage = 'Please enter a valid year between 1950 and 2025';
        }
    }
    // Validate date of birth
    else if (fieldName === 'dob' && value) {
        const dob = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        
        if (age < 16 || age > 100) {
            isValid = false;
            errorMessage = 'Applicant must be between 16 and 100 years old';
        }
    }

    // Display error if invalid
    if (!isValid) {
        field.classList.add('invalid');
        errorElement.textContent = errorMessage;
    }

    return isValid;
}

// Validate entire step
function validateStep(stepNumber) {
    const stepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    const inputs = stepElement.querySelectorAll('input, textarea');
    let isStepValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isStepValid = false;
        }
    });

    return isStepValid;
}

// Save data for a single field
function saveFieldData(field) {
    formData[field.name] = field.value;
    sessionStorage.setItem('admissionFormData', JSON.stringify(formData));
}

// Save data for current step
function saveStepData(stepNumber) {
    const stepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    const inputs = stepElement.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        formData[input.name] = input.value;
    });

    sessionStorage.setItem('admissionFormData', JSON.stringify(formData));
    sessionStorage.setItem('currentStep', currentStep);
}

// Load form data from sessionStorage
function loadFormData() {
    const savedData = sessionStorage.getItem('admissionFormData');
    const savedStep = sessionStorage.getItem('currentStep');

    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Populate all fields with saved data
        Object.keys(data).forEach(key => {
            const field = document.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = data[key];
                formData[key] = data[key];
            }
        });
    }

    if (savedStep) {
        goToStep(parseInt(savedStep));
    }
}

// Submit form
function submitForm() {
    console.log('Form submitted successfully!');
    console.log('Form Data:', formData);

    // Hide form and show success message
    document.getElementById('admissionForm').style.display = 'none';
    document.querySelector('.form-header').style.display = 'none';
    document.getElementById('successMessage').classList.remove('hidden');
    document.getElementById('successMessage').classList.add('show');

    // Clear session storage
    sessionStorage.removeItem('admissionFormData');
    sessionStorage.removeItem('currentStep');
}