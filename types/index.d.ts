/* eslint-disable no-unused-vars */

declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

declare type Gender = 'Male' | 'Female' | 'Other';
declare type Status =
  | 'pending'
  | 'scheduled'
  | 'cancelled'
  | 'completed'
  | 'no-show';

declare interface LoginParams {
  email: string;
  password: string;
}
declare interface CreateUserParams {
  email: string;
  phone: string;
  name: string;
}
declare interface User extends CreateUserParams {
  $id: string;
}

declare interface RegisterUserParams {
  userId: string;
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
  phone: string;
  name: string;
  email: string;
}

declare type CreateAppointmentParams = {
  userId: string;
  patient: string;
  physician: string;
  reason: string;
  schedule: Date;
  status: Status;
  note: string | undefined;
};

declare type UpdateAppointmentParams = {
  appointmentId: string;
  userId: string;
  // timeZone: string;
  appointment: Appointment;
  type: string;
};
