/**
 * Safely parse JSON fields from Supabase that might be strings or already parsed
 */
export const parseJsonField = (field: any): any[] => {
  if (!field) return [];
  if (Array.isArray(field)) return field; // Already an array
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn(`Failed to parse JSON field:`, field, error);
      return [];
    }
  }
  return [];
};

/**
 * Process a job application object to ensure all JSON fields are properly parsed
 */
export const processJobApplicationData = (app: any) => {
  return {
    ...app,
    techStack: parseJsonField(app.techStack),
    benefits: parseJsonField(app.benefits),
    requirements: parseJsonField(app.requirements),
    responsibilities: parseJsonField(app.responsibilities)
  };
};

/**
 * Prepare job application data for Supabase storage by converting arrays to JSON strings
 */
export const prepareJobApplicationForStorage = (data: any) => {
  const prepared = { ...data };
  
  if (data.techStack && Array.isArray(data.techStack)) {
    prepared.techStack = JSON.stringify(data.techStack);
  }
  if (data.benefits && Array.isArray(data.benefits)) {
    prepared.benefits = JSON.stringify(data.benefits);
  }
  if (data.requirements && Array.isArray(data.requirements)) {
    prepared.requirements = JSON.stringify(data.requirements);
  }
  if (data.responsibilities && Array.isArray(data.responsibilities)) {
    prepared.responsibilities = JSON.stringify(data.responsibilities);
  }
  
  return prepared;
};