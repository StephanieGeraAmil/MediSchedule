import { z } from 'zod';
export const UserFormValidation = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name must be at most 50 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z
    .string()
    .refine(phone => /^\+\d{10,15}$/.test(phone), 'Invalid phone number'),

  password: z.string().min(8, 'Password must be at least 8 characters.'),
});
export const PassFormValidation = z.object({
  oldPassword: z.string().min(8, 'Password must be at least 8 characters.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});
export const LoginValidation = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const PatientFormValidation = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .refine(phone => /^\+\d{10,15}$/.test(phone), 'Invalid phone number'),
  birthDate: z.coerce.date(),
  gender: z.enum(['Male', 'Female', 'Other']),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address must be at most 500 characters'),
  occupation: z
    .string()
    .min(2, 'Occupation must be at least 2 characters')
    .max(500, 'Occupation must be at most 500 characters'),
  emergencyContactName: z
    .string()
    .min(2, 'Contact name must be at least 2 characters')
    .max(50, 'Contact name must be at most 50 characters'),
  emergencyContactNumber: z
    .string()
    .refine(
      emergencyContactNumber => /^\+\d{10,15}$/.test(emergencyContactNumber),
      'Invalid phone number'
    ),
  primaryPhysician: z.string().min(2, 'Select at least one doctor'),
  insuranceProvider: z
    .string()
    .min(2, 'Insurance name must be at least 2 characters')
    .max(50, 'Insurance name must be at most 50 characters'),
  insurancePolicyNumber: z
    .string()
    .min(2, 'Policy number must be at least 2 characters')
    .max(50, 'Policy number must be at most 50 characters'),
  allergies: z.string().optional(),
  currentMedication: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  pastMedicalHistory: z.string().optional(),
  identificationType: z.string().optional(),
  identificationNumber: z.string().optional(),
  identificationDocument: z.custom<File[]>().optional(),
  treatmentConsent: z
    .boolean()
    .default(false)
    .refine(value => value === true, {
      message: 'You must consent to treatment in order to proceed',
    })
    .optional(),
  disclosureConsent: z
    .boolean()
    .default(false)
    .refine(value => value === true, {
      message: 'You must consent to disclosure in order to proceed',
    })
    .optional(),
  privacyConsent: z
    .boolean()
    .default(false)
    .refine(value => value === true, {
      message: 'You must consent to privacy in order to proceed',
    })
    .optional(),
});
export const CreateAppointmentSchema = z.object({
  // physician: z.string().min(2, 'Select a doctor'),
  // doctor: z.string().min(2, 'Select a doctor'),
  professional: z.string().min(2, 'Select a doctor'),
  schedule: z.coerce.date(),
  reason: z
    .string()
    .min(2, 'Reason must be at least 2 characters')
    .max(500, 'Reason must be at most 500 characters'),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
  identificationNumber: z.string().optional(),
});
export const DoctorFormValidation = z.object({
  weeklyAvailability: z.array(
    z.object({
      day: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    })
  ),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),
  speciality: z.string().min(2, 'Speciality must be at least 2 characters'),

  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .refine(phone => /^\+\d{10,15}$/.test(phone), 'Invalid phone number'),
  birthDate: z.coerce.date(),
  identificationNumber: z.string(),
  photoFile: z.custom<File[]>().optional(),
});

export const ScheduleAppointmentSchema = z.object({
  // physician: z.string().min(2, 'Select at least one doctor'),
  // doctor: z.string().min(2, 'Select at least one doctor'),
  professional: z.string().min(2, 'Select at least one doctor'),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
  result: z.string().optional(),
});

export const CancelAppointmentSchema = z.object({
  // physician: z.string().min(2, 'Select at least one doctor'),
  // doctor: z.string().min(2, 'Select at least one doctor'),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z
    .string()
    .min(2, 'Reason must be at least 2 characters')
    .max(500, 'Reason must be at most 500 characters'),
});
export const CompleteAppointmentSchema = z.object({
  // physician: z.string().min(2, 'Select at least one doctor'),
  // doctor: z.string().min(2, 'Select at least one doctor'),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  result: z.string().optional(),
});

export function getAppointmentSchema(type: string) {
  switch (type) {
    case 'create':
      return CreateAppointmentSchema;
    case 'cancel':
      return CancelAppointmentSchema;
    case 'complete':
      return CompleteAppointmentSchema;
    default:
      return ScheduleAppointmentSchema;
  }
}
