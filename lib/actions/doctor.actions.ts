'use server';
const sharp = require('sharp');
import { ID, InputFile, Query } from 'node-appwrite';
import {
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  DOCTOR_COLLECTION_ID,
  PROJECT_ID,
  databases,
  account,
  storage,
  users,
} from '../appwrite.config';
import { parseStringify } from '../utils';

// REGISTER DOCTOR
export const createDoctor = async ({
  photoFile,
  ...doctorData
}: RegisterDoctorParams) => {
  try {
    console.log('in the action');
    const transformedImage = await sharp(photoFile)
      .resize(80, 80) // Resize to 80x80
      .toBuffer(); // Convert to a buffer for upload
    // Upload file ->  // https://appwrite.io/docs/references/cloud/client-web/storage#createFile
    let file;
    if (transformedImage) {
      const inputFile =
        transformedImage &&
        InputFile.fromBlob(
          transformedImage?.get('blobFile') as Blob,
          transformedImage?.get('fileName') as string
        );

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }
    console.log(file);
    console.log(doctorData);

    // Create new doctor document -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#createDocument
    const newDoctor = await databases.createDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      ID.unique(),
      {
        photoFileId: file?.$id ? file.$id : null,
        photoFileUrl: file?.$id
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view??project=${PROJECT_ID}`
          : null,
        ...doctorData,
      }
    );

    return parseStringify(newDoctor);
  } catch (error) {
    console.error('An error occurred while creating a new doctor:', error);
  }
};
