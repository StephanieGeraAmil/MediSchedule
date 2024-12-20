'use server';
const sharp = require('sharp');
import { ID, InputFile, Query } from 'node-appwrite';
import {
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  DOCTOR_COLLECTION_ID,
  PROFESSIONAL_COLLECTION_ID,
  PROJECT_ID,
  databases,
  account,
  storage,
  users,
} from '../appwrite.config';
import { parseStringify } from '../utils';
import { Buffer } from 'buffer';

// REGISTER DOCTOR
export const createDoctor = async ({
  photoFile,
  ...doctorData
}: RegisterDoctorParams) => {
  try {
    const newuser = await users.create(
      ID.unique(),
      doctorData.email,
      doctorData.phone,
      doctorData.password,
      doctorData.name
    );
    if (newuser) {
      let file;
      if (photoFile) {
        const blobFile = photoFile.get('blobFile');
        const fileName = photoFile.get('fileName');

        if (blobFile instanceof Blob) {
          // Convert Blob to Buffer
          const bufferFile = Buffer.from(await blobFile.arrayBuffer());
          const transformedImage = await sharp(bufferFile)
            .resize(80, 80)
            .composite([
              {
                input: Buffer.from(
                  `<svg width="80" height="80">
                  <rect width="80" height="80" rx="40" ry="40" />
                </svg>`
                ),
                blend: 'dest-in',
              },
            ])
            .toBuffer();
          // Upload file ->  // https://appwrite.io/docs/references/cloud/client-web/storage#createFile

          if (transformedImage) {
            const inputFile = InputFile.fromBlob(
              new Blob([transformedImage]),
              fileName as string
            );

            file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
          }
        }
      }

      const { password, ...doctorDataWithoutPassword } = doctorData;
      // Create new doctor document -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#createDocument
      const newDoctor = await databases.createDocument(
        DATABASE_ID!,
        // DOCTOR_COLLECTION_ID!,
        PROFESSIONAL_COLLECTION_ID!,
        ID.unique(),
        {
          photoFileId: file?.$id ? file.$id : null,
          photoFileUrl: file?.$id
            ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view??project=${PROJECT_ID}`
            : null,
          ...doctorDataWithoutPassword,
          userId: newuser?.$id,
        }
      );

      return parseStringify(newDoctor);
    }
  } catch (error) {
    console.error('An error occurred while creating a new doctor:', error);
  }
};

// GET DOCTOR
export const getDoctor = async (userId: string) => {
  try {
    const doctors = await databases.listDocuments(
      DATABASE_ID!,
      // DOCTOR_COLLECTION_ID!,
      PROFESSIONAL_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );

    return parseStringify(doctors.documents[0]);
  } catch (error) {
    console.error(
      'An error occurred while retrieving the doctor details:',
      error
    );
  }
};

//  GET DOCTOR LIST
export const getDoctorList = async () => {
  try {
    const doctors = await databases.listDocuments(
      DATABASE_ID!,
      // DOCTOR_COLLECTION_ID!,
      PROFESSIONAL_COLLECTION_ID!,
      [Query.orderDesc('$createdAt')]
    );
    return parseStringify(doctors);
  } catch (error) {
    console.error('An error occurred while retrieving the doctors:', error);
  }
};

//UPDATE DOCTOR
export const updateDoctor = async ({
  user,
  doctorId,
  ...doctorUpdates
}: UpdateDoctorParams) => {
  try {
    // const user = await users.get(userId);
    if (user.email != doctorUpdates.email) {
      await users.updateEmail(user.$id, doctorUpdates.email);
    }
    if (user.phone != doctorUpdates.phone) {
      await users.updatePhone(user.$id, doctorUpdates.phone);
    }
    if (user.name != doctorUpdates.name) {
      await users.updateName(user.$id, doctorUpdates.name);
    }

    // Update the patient document
    const updatedDoctor = await databases.updateDocument(
      DATABASE_ID!,
      // DOCTOR_COLLECTION_ID!,
      PROFESSIONAL_COLLECTION_ID!,
      doctorId,
      {
        ...doctorUpdates,
      }
    );

    return parseStringify(updatedDoctor);
  } catch (error) {
    console.error('An error occurred while updating the doctor:', error);
  }
};
