// Stubbed Supabase storage utilities

export const SERVICE_IMAGES_BUCKET = 'service-images';
export const MENU_IMAGES_BUCKET = 'service-images';

export async function uploadToSupabase(
  file: File | string,
  bucketName: string = SERVICE_IMAGES_BUCKET,
  existingPath?: string
): Promise<string | null> {
  console.log('API Call: POST', { url: `/storage/${bucketName}/upload`, file: typeof file, existingPath });
  console.log('API Call Complete: POST', { url: `/storage/${bucketName}/upload`, result: null });
  return null;
}

export async function migrateImageToSupabase(
  imageUrl: string | null | undefined,
  bucketName: string = SERVICE_IMAGES_BUCKET
): Promise<string | null> {
  console.log('API Call: POST', { url: `/storage/${bucketName}/migrate`, imageUrl });
  console.log('API Call Complete: POST', { url: `/storage/${bucketName}/migrate`, result: imageUrl });
  return imageUrl;
}

export async function migrateServiceImagesToSupabase(service: any): Promise<any> {
  console.log('API Call: POST', { url: '/storage/migrate-service', serviceId: service?.id });
  console.log('API Call Complete: POST', { url: '/storage/migrate-service', result: service });
  return service;
}

export async function bulkMigrateServicesToSupabase(services: any[]): Promise<boolean> {
  console.log('API Call: POST', { url: '/storage/bulk-migrate', count: services.length });
  console.log('API Call Complete: POST', { url: '/storage/bulk-migrate', result: false });
  return false;
}
