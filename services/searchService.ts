import { Hostel, Job, Event, NewsItem } from '../types';

interface SearchableHostel extends Omit<Hostel, 'type'> {
  searchType: 'hostel';
}

interface SearchableJob extends Omit<Job, 'type'> {
  searchType: 'job';
  type: Job['type'];
}

interface SearchableEvent extends Omit<Event, 'type'> {
  searchType: 'event';
}

interface SearchableNews extends Omit<NewsItem, 'type'> {
  searchType: 'news';
}

type SearchableItem = SearchableHostel | SearchableJob | SearchableEvent | SearchableNews;

class SearchService {
  private hostels: SearchableHostel[] = [];
  private jobs: SearchableJob[] = [];
  private events: SearchableEvent[] = [];
  private news: SearchableNews[] = [];

  // Helper method to check if a string contains a query (case insensitive)
  private matches(text: string | undefined, query: string): boolean {
    return text?.toLowerCase().includes(query.toLowerCase()) ?? false;
  }

  // Update methods
  updateHostels(hostels: Hostel[]) {
    this.hostels = hostels.map(h => ({ ...h, searchType: 'hostel' }));
  }

  updateJobs(jobs: Job[]) {
    this.jobs = jobs.map(j => ({ ...j, searchType: 'job' }));
  }

  updateEvents(events: Event[]) {
    this.events = events.map(e => ({ ...e, searchType: 'event' }));
  }

  updateNews(news: NewsItem[]) {
    this.news = news.map(n => ({ ...n, searchType: 'news' }));
  }

  // Search methods
  searchAll(query: string): SearchableItem[] {
    if (!query.trim()) return [];
    
    const results: SearchableItem[] = [];
    const normalizedQuery = query.toLowerCase();

    // Search in all collections
    results.push(...this.searchHostels(query));
    results.push(...this.searchJobs(query));
    results.push(...this.searchEvents(query));
    results.push(...this.searchNews(query));

    // Sort results by relevance (exact matches first)
    return results.sort((a, b) => {
      const aTitle = this.getItemTitle(a).toLowerCase();
      const bTitle = this.getItemTitle(b).toLowerCase();
      
      const aExactMatch = aTitle === normalizedQuery;
      const bExactMatch = bTitle === normalizedQuery;
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      const aStartsWith = aTitle.startsWith(normalizedQuery);
      const bStartsWith = bTitle.startsWith(normalizedQuery);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return 0;
    });
  }

  private getItemTitle(item: SearchableItem): string {
    return 'title' in item ? item.title : item.name;
  }

  searchHostels(query: string): SearchableHostel[] {
    const normalizedQuery = query.toLowerCase();
    return this.hostels.filter(hostel => 
      this.matches(hostel.name, query) ||
      this.matches(hostel.location, query) ||
      this.matches(hostel.description, query) ||
      this.matches(hostel.priceRange, query)
    );
  }

  searchJobs(query: string): SearchableJob[] {
    return this.jobs.filter(job =>
      this.matches(job.title, query) ||
      this.matches(job.company, query) ||
      this.matches(job.description, query)
    );
  }

  searchEvents(query: string): SearchableEvent[] {
    return this.events.filter(event =>
      this.matches(event.title, query) ||
      this.matches(event.location, query) ||
      this.matches(event.description, query)
    );
  }

  searchNews(query: string): SearchableNews[] {
    return this.news.filter(item =>
      this.matches(item.title, query) ||
      this.matches(item.description, query) ||
      this.matches(item.source, query)
    );
  }

  // Filter methods
  filterHostelsByPrice(maxPrice: number): SearchableHostel[] {
    return this.hostels.filter(hostel => {
      const price = parseInt(hostel.priceRange.split('-')[1].trim().replace(/[^0-9]/g, ''));
      return price <= maxPrice;
    });
  }

  filterHostelsByUniversity(universityId: string): SearchableHostel[] {
    return this.hostels.filter(hostel => hostel.universityId === universityId);
  }

  filterJobsByType(type: Job['type']): SearchableJob[] {
    return this.jobs.filter(job => job.type === type);
  }

  // Combined search and filter
  searchAndFilterHostels(query: string, filters: {
    maxPrice?: number;
    universityId?: string;
  }): SearchableHostel[] {
    let results = this.searchHostels(query);

    if (filters.maxPrice) {
      results = results.filter(hostel => {
        const price = parseInt(hostel.priceRange.split('-')[1].trim().replace(/[^0-9]/g, ''));
        return price <= filters.maxPrice!;
      });
    }

    if (filters.universityId) {
      results = results.filter(hostel => hostel.universityId === filters.universityId);
    }

    return results;
  }
}

// Create a singleton instance
export const searchService = new SearchService();

// Export the service class for testing
export default SearchService;