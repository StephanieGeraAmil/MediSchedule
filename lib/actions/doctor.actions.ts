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
    console.log(photoFile);
    let file;
    if (photoFile) {
      // Convert FormData to Buffer if needed
      let bufferFile;
      if (photoFile instanceof FormData) {
        const fileField = photoFile.get('file'); // Adjust the key to match your form field
        if (fileField instanceof Blob) {
          bufferFile = Buffer.from(await fileField.arrayBuffer());
        } else {
          throw new Error('Invalid file input: Expected a Blob');
        }
      } else if (photoFile instanceof Buffer) {
        bufferFile = photoFile;
      } else {
        throw new Error('Unsupported file type for photoFile');
      }
      const transformedImage = await sharp(bufferFile)
        .resize(80, 80) // Resize to 80x80
        .toBuffer(); // Convert to a buffer for upload
      // Upload file ->  // https://appwrite.io/docs/references/cloud/client-web/storage#createFile

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
    }

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
