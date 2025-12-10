import { HOSTELS, NEWS_ITEMS, EVENTS, JOBS, ROOMMATE_PROFILES } from '../constants';
import { Hostel, NewsItem, Event, Job, RoommateProfile } from '../types';

// In-memory database simulation
let db = {
    hostels: [...HOSTELS],
    news: [...NEWS_ITEMS],
    events: [...EVENTS],
    jobs: [...JOBS],
    roommate_profiles: [...ROOMMATE_PROFILES],
};

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic CRUD factory for the mock database
const createCrudService = <T extends { id: string }>(collectionName: keyof typeof db) => {
  return {
    async getAll(): Promise<T[]> {
      await simulateDelay(200);
      return [...db[collectionName]] as unknown as T[];
    },

    async add(item: Omit<T, 'id'>): Promise<T> {
      await simulateDelay(300);
      const newItem = { ...item, id: `${collectionName}-${Date.now()}` } as T;
      (db[collectionName] as any[]).push(newItem);
      return newItem;
    },

    async update(id: string, item: Partial<Omit<T, 'id'>>): Promise<void> {
      await simulateDelay(300);
      const collection = db[collectionName] as unknown as T[];
      const index = collection.findIndex(i => i.id === id);
      if (index > -1) {
          collection[index] = { ...collection[index], ...item };
      }
    },
    
    // Special update for profiles which uses set-like logic
    async set(item: T): Promise<void> {
        await simulateDelay(300);
        const collection = db[collectionName] as unknown as T[];
        const index = collection.findIndex(i => i.id === item.id);
        if (index > -1) {
            collection[index] = item;
        } else {
            collection.push(item);
        }
    },

    async remove(id: string): Promise<void> {
      await simulateDelay(400);
      db[collectionName] = db[collectionName].filter(i => i.id !== id) as any;
    },
  };
};

export const hostelService = createCrudService<Hostel>('hostels');
export const newsService = createCrudService<NewsItem>('news');
export const eventService = createCrudService<Event>('events');
export const jobService = createCrudService<Job>('jobs');
export const roommateProfileService = createCrudService<RoommateProfile>('roommate_profiles');

// Create handlers compatible with the AdminDashboard
const createAdaptedCrudHandler = (service) => ({
    add: async (item) => { await service.add(item); },
    update: async (item) => { await service.update(item.id, item); },
    remove: async (id) => { await service.remove(id); },
});

export const hostelHandler = createAdaptedCrudHandler(hostelService);
export const newsHandler = createAdaptedCrudHandler(newsService);
export const eventHandler = createAdaptedCrudHandler(eventService);
export const jobHandler = createAdaptedCrudHandler(jobService);