'use server';

import { ID, InputFile, Query } from 'node-appwrite';

import {
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  CLIENT_COLLECTION_ID,
  PROJECT_ID,
  databases,
  account,
  storage,
  users,
} from '../appwrite.config';
import { parseStringify } from '../utils';

// REGISTER PATIENT
export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    // Upload file ->  // https://appwrite.io/docs/references/cloud/client-web/storage#createFile
    let file;
    if (identificationDocument) {
      const inputFile =
        identificationDocument &&
        InputFile.fromBlob(
          identificationDocument?.get('blobFile') as Blob,
          identificationDocument?.get('fileName') as string
        );

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    // Create new patient document -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#createDocument
    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      // PATIENT_COLLECTION_ID!,
      CLIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id ? file.$id : null,
        identificationDocumentUrl: file?.$id
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view??project=${PROJECT_ID}`
          : null,
        ...patient,
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.error('An error occurred while creating a new patient:', error);
  }
};

// GET PATIENT
export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      // PATIENT_COLLECTION_ID!,
      CLIENT_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );

    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.error(
      'An error occurred while retrieving the patient details:',
      error
    );
  }
};
//UPDATE PATIENT
export const updatePatient = async ({
  user,
  patientId,
  ...patientUpdates
}: UpdatePatientParams) => {
  try {
    if (user.email != patientUpdates.email) {
      await users.updateEmail(user.$id, patientUpdates.email);
    }
    if (user.phone != patientUpdates.phone) {
      await users.updatePhone(user.$id, patientUpdates.phone);
    }
    if (user.name != patientUpdates.name) {
      await users.updateName(user.$id, patientUpdates.name);
    }

    // Update the patient document
    const updatedPatient = await databases.updateDocument(
      DATABASE_ID!,
      // PATIENT_COLLECTION_ID!,
      CLIENT_COLLECTION_ID!,
      patientId,
      {
        ...patientUpdates,
      }
    );

    return parseStringify(updatedPatient);
  } catch (error) {
    console.error('An error occurred while updating the patient:', error);
  }
};
export const getAllPatients = async () => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      CLIENT_COLLECTION_ID!
    );

    return parseStringify(patients.documents);
  } catch (error) {
    console.error('An error occurred while retrieving all patients:', error);
  }
};
