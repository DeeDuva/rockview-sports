/**
 * validators.js - Form validation utility module
 * Provides validation rules and error handling for all forms
 */

const Validators = {
  // Match validation
  validateMatch(matchData) {
    const errors = [];

    // Validate sport
    if (!matchData.sport || matchData.sport.trim() === '') {
      errors.push('Sport is required');
    }

    // Validate teams
    if (!matchData.teamA || matchData.teamA.trim() === '') {
      errors.push('Team A name is required');
    }
    if (!matchData.teamB || matchData.teamB.trim() === '') {
      errors.push('Team B name is required');
    }
    if (matchData.teamA === matchData.teamB) {
      errors.push('Team A and Team B must be different');
    }

    // Validate date (must be in future)
    if (!matchData.date) {
      errors.push('Match date is required');
    } else {
      const matchDate = new Date(matchData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (matchDate < today) {
        errors.push('Match date must be in the future');
      }
    }

    // Validate time
    if (!matchData.time || matchData.time.trim() === '') {
      errors.push('Match time is required');
    } else if (!/^\d{1,2}:\d{2}$/.test(matchData.time)) {
      errors.push('Time must be in HH:MM format');
    }

    // Validate venue
    if (!matchData.venue || matchData.venue.trim() === '') {
      errors.push('Venue is required');
    }

    // Validate category
    if (!matchData.category || matchData.category.trim() === '') {
      errors.push('Category is required');
    }

    return errors;
  },

  // Result validation
  validateResult(resultData) {
    const errors = [];

    // Validate sport
    if (!resultData.sport || resultData.sport.trim() === '') {
      errors.push('Sport is required');
    }

    // Validate teams
    if (!resultData.teamA || resultData.teamA.trim() === '') {
      errors.push('Team A name is required');
    }
    if (!resultData.teamB || resultData.teamB.trim() === '') {
      errors.push('Team B name is required');
    }
    if (resultData.teamA === resultData.teamB) {
      errors.push('Team A and Team B must be different');
    }

    // Validate scores (must be numeric)
    const scoreA = parseInt(resultData.scoreA);
    const scoreB = parseInt(resultData.scoreB);

    if (isNaN(scoreA) || scoreA < 0) {
      errors.push('Team A score must be a non-negative number');
    }
    if (isNaN(scoreB) || scoreB < 0) {
      errors.push('Team B score must be a non-negative number');
    }

    // Validate date
    if (!resultData.date) {
      errors.push('Result date is required');
    }

    // Validate venue
    if (!resultData.venue || resultData.venue.trim() === '') {
      errors.push('Venue is required');
    }

    return errors;
  },

  // News validation
  validateNews(newsData) {
    const errors = [];

    // Validate title
    if (!newsData.title || newsData.title.trim() === '') {
      errors.push('Title is required');
    } else if (newsData.title.length < 5) {
      errors.push('Title must be at least 5 characters');
    } else if (newsData.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }

    // Validate summary
    if (!newsData.summary || newsData.summary.trim() === '') {
      errors.push('Summary is required');
    } else if (newsData.summary.length < 10) {
      errors.push('Summary must be at least 10 characters');
    } else if (newsData.summary.length > 500) {
      errors.push('Summary must be less than 500 characters');
    }

    // Validate content
    if (!newsData.content || newsData.content.trim() === '') {
      errors.push('Content is required');
    } else if (newsData.content.length < 20) {
      errors.push('Content must be at least 20 characters');
    }

    // Validate category
    if (!newsData.category || newsData.category.trim() === '') {
      errors.push('Category is required');
    }

    // Validate author
    if (!newsData.author || newsData.author.trim() === '') {
      errors.push('Author is required');
    }

    // Validate date
    if (!newsData.date) {
      errors.push('Date is required');
    }

    return errors;
  },

  // Admin validation
  validateAdmin(adminData) {
    const errors = [];

    // Validate username
    if (!adminData.username || adminData.username.trim() === '') {
      errors.push('Username is required');
    } else if (adminData.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(adminData.username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }

    // Validate display name
    if (!adminData.name || adminData.name.trim() === '') {
      errors.push('Display name is required');
    } else if (adminData.name.length < 2) {
      errors.push('Display name must be at least 2 characters');
    }

    // Validate password (if provided)
    if (adminData.password) {
      if (adminData.password.length < 6) {
        errors.push('Password must be at least 6 characters');
      } else if (adminData.password.length > 50) {
        errors.push('Password must be less than 50 characters');
      }
    }

    return errors;
  },

  // Password validation
  validatePassword(password) {
    const errors = [];

    if (!password || password === '') {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    } else if (password.length > 50) {
      errors.push('Password must be less than 50 characters');
    }

    return errors;
  },

  // Utility: Display validation errors
  displayErrors(containerElement, errors) {
    containerElement.innerHTML = '';
    if (errors.length === 0) {
      containerElement.style.display = 'none';
      return;
    }

    containerElement.style.display = 'block';
    const errorList = errors.map(err => `<li>${err}</li>`).join('');
    containerElement.innerHTML = `<ul style="margin: 0; padding-left: 20px;">${errorList}</ul>`;
  },

  // Utility: Clear validation errors
  clearErrors(containerElement) {
    containerElement.innerHTML = '';
    containerElement.style.display = 'none';
  }
};

// Expose globally
window.Validators = Validators;
