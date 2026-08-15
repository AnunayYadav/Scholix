import gdriveMappingsRaw from '../scripts/gdrive_mappings.json';

const gdriveMappings: Record<string, string> = gdriveMappingsRaw as Record<string, string>;

export const getGDriveFileId = (file: { id?: string; storage_path?: string; gdrive_file_id?: string } | null | undefined): string | null => {
  if (!file) return null;
  if (file.gdrive_file_id) return file.gdrive_file_id;
  if (file.storage_path && gdriveMappings[file.storage_path]) return gdriveMappings[file.storage_path];
  if (file.id && gdriveMappings[file.id]) return gdriveMappings[file.id];
  return null;
};

export const getGDriveDownloadUrl = (gdriveId: string): string => {
  return `https://drive.google.com/uc?export=download&id=${gdriveId}`;
};

export const getGDriveImageUrl = (gdriveId: string): string => {
  return `https://lh3.googleusercontent.com/d/${gdriveId}`;
};
