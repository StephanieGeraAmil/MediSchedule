import { Models } from 'node-appwrite';

export interface Patient extends Models.Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: Gender;
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string | undefined;
  currentMedication: string | undefined;
  familyMedicalHistory: string | undefined;
  pastMedicalHistory: string | undefined;
  identificationType: string | undefined;
  identificationNumber: string | undefined;
  identificationDocument: FormData | undefined;
  privacyConsent: boolean;
}
export interface Doctor extends Models.Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  speciality: string;
  identificationNumber: string | undefined;
  photoFile: FormData | undefined;
}

export interface Appointment extends Models.Document {
  // patient: Patient;
  client: Patient;
  schedule: Date;
  status: Status;
  // physician: string;
  reason: string;
  note: string;
  cancellationReason: string | null;
  result: string | null;
  // doctor: Doctor;
  professional: Doctor;
}
