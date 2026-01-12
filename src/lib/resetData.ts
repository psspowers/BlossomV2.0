import { db } from './db';
import { seedDatabase } from './seed';

export async function resetDatabase(): Promise<void> {
  await db.logs.clear();
  console.log('Database cleared');
  await seedDatabase();
  console.log('Database reseeded with updated data');
}
