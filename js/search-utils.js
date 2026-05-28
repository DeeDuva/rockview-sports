/**
 * search-utils.js - Search and filter utility module
 * Provides search, filter, and sorting capabilities
 */

const SearchUtils = {
  // Search matches by teams, sport, or venue
  searchMatches(matches, query) {
    if (!query || query.trim() === '') return matches;
    
    const q = query.toLowerCase();
    return matches.filter(match => 
      match.sport.toLowerCase().includes(q) ||
      match.teamA.toLowerCase().includes(q) ||
      match.teamB.toLowerCase().includes(q) ||
      match.venue.toLowerCase().includes(q) ||
      match.category.toLowerCase().includes(q)
    );
  },

  // Search results by teams or sport
  searchResults(results, query) {
    if (!query || query.trim() === '') return results;
    
    const q = query.toLowerCase();
    return results.filter(result =>
      result.sport.toLowerCase().includes(q) ||
      result.teamA.toLowerCase().includes(q) ||
      result.teamB.toLowerCase().includes(q) ||
      result.venue.toLowerCase().includes(q)
    );
  },

  // Search news by title, summary, or category
  searchNews(news, query) {
    if (!query || query.trim() === '') return news;
    
    const q = query.toLowerCase();
    return news.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q)
    );
  },

  // Filter matches by date range
  filterMatchesByDateRange(matches, startDate, endDate) {
    return matches.filter(match => {
      const matchDate = new Date(match.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return matchDate >= start && matchDate <= end;
    });
  },

  // Filter matches by sport
  filterMatchesBySport(matches, sport) {
    if (!sport) return matches;
    return matches.filter(match => match.sport.toLowerCase() === sport.toLowerCase());
  },

  // Filter results by sport
  filterResultsBySport(results, sport) {
    if (!sport) return results;
    return results.filter(result => result.sport.toLowerCase() === sport.toLowerCase());
  },

  // Filter news by category
  filterNewsByCategory(news, category) {
    if (!category) return news;
    return news.filter(item => item.category.toLowerCase() === category.toLowerCase());
  },

  // Sort matches by date (ascending)
  sortMatchesByDate(matches, ascending = true) {
    return [...matches].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return ascending ? dateA - dateB : dateB - dateA;
    });
  },

  // Sort results by date (descending)
  sortResultsByDate(results, ascending = false) {
    return [...results].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return ascending ? dateA - dateB : dateB - dateA;
    });
  },

  // Sort news by date (descending)
  sortNewsByDate(news, ascending = false) {
    return [...news].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return ascending ? dateA - dateB : dateB - dateA;
    });
  },

  // Find duplicate matches (same sport, teams on same date)
  findDuplicateMatches(matches, newMatch) {
    return matches.filter(match =>
      match.id !== newMatch.id &&
      match.sport.toLowerCase() === newMatch.sport.toLowerCase() &&
      match.date === newMatch.date &&
      ((match.teamA.toLowerCase() === newMatch.teamA.toLowerCase() &&
        match.teamB.toLowerCase() === newMatch.teamB.toLowerCase()) ||
       (match.teamA.toLowerCase() === newMatch.teamB.toLowerCase() &&
        match.teamB.toLowerCase() === newMatch.teamA.toLowerCase()))
    );
  },

  // Find duplicate results (same sport, teams on same date)
  findDuplicateResults(results, newResult) {
    return results.filter(result =>
      result.id !== newResult.id &&
      result.sport.toLowerCase() === newResult.sport.toLowerCase() &&
      result.date === newResult.date &&
      ((result.teamA.toLowerCase() === newResult.teamA.toLowerCase() &&
        result.teamB.toLowerCase() === newResult.teamB.toLowerCase()) ||
       (result.teamA.toLowerCase() === newResult.teamB.toLowerCase() &&
        result.teamB.toLowerCase() === newResult.teamA.toLowerCase()))
    );
  },

  // Combine search and filter
  searchAndFilter(items, query, filterFn = null) {
    let result = items;
    
    if (query && query.trim() !== '') {
      const q = query.toLowerCase();
      result = result.filter(item => {
        // Generic search across all string properties
        return Object.values(item).some(val =>
          typeof val === 'string' && val.toLowerCase().includes(q)
        );
      });
    }

    if (filterFn && typeof filterFn === 'function') {
      result = result.filter(filterFn);
    }

    return result;
  },

  // Paginate results
  paginate(items, page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      items: items.slice(start, end),
      total: items.length,
      page,
      pageSize,
      totalPages: Math.ceil(items.length / pageSize)
    };
  }
};

// Expose globally
window.SearchUtils = SearchUtils;
