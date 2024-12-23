'use server';

import { revalidatePath } from 'next/cache';
import { ID, Permission, Query, Role } from 'node-appwrite';

import { Appointment } from '@/types/appwrite.types';

import {
  APPOINTMENT_COLLECTION_ID,
  PATIENT_COLLECTION_ID,
  CLIENT_COLLECTION_ID,
  DOCTOR_COLLECTION_ID,
  PROFESSIONAL_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging,
  account,
  users,
} from '../appwrite.config';
import { formatDateTime, parseStringify } from '../utils';

const checkSession = async () => {
  try {
    const user = await account.get();
    return true; // User is logged in
  } catch (error) {
    return false; // User is not logged in
  }
};
//  CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const user = checkSession();
    // first I need to check that there is no appoinment for the same dr in that schedule
    const prevAppointment = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        // Query.equal('physician', appointment.physician),
        Query.equal('professional', appointment.professional),
        Query.equal('schedule', appointment.schedule.toISOString()),
      ]
    );
    if (prevAppointment.documents.length === 0) {
      // if (!appointment.patient) {
      if (!appointment.client) {
        //if i dont  have a patient
        if (
          appointment.userId &&
          appointment.userId != process.env.NEXT_PUBLIC_ADMIN_USER_ID
        ) {
          //if i have an userId i get the patient that has that userId
          const patients = await databases.listDocuments(
            DATABASE_ID!,
            // PATIENT_COLLECTION_ID!,
            CLIENT_COLLECTION_ID!,
            [Query.equal('userId', [appointment.userId])]
          );
          if (!patients.documents.length) {
            throw new Error('No patient found for the given user ID.');
          } else {
            // appointment.patient = patients.documents[0].$id;
            appointment.client = patients.documents[0].$id;
            //  appointment.userId = patients?.documents[0]?.userId || '';
          }
        } else if (appointment.identificationNumber) {
          //i get the patient that has a certain identification number
          const patients = await databases.listDocuments(
            DATABASE_ID!,
            // PATIENT_COLLECTION_ID!,
            CLIENT_COLLECTION_ID!,
            [
              Query.equal('identificationNumber', [
                appointment.identificationNumber,
              ]),
            ]
          );
          if (!patients.documents.length) {
            throw new Error(
              'No patient found for the given dentification number.'
            );
          } else {
            // appointment.patient = patients.documents[0].$id;
            appointment.client = patients.documents[0].$id;
            // appointment.userId = patients?.documents[0]?.userId || '';
          }
        }
      }
      const appointmentToCreate = {
        schedule: appointment.schedule,
        // patient: appointment.patient,
        client: appointment.client,
        professional: appointment.professional,
        note: appointment.note,
        reason: appointment.reason,
        status: 'scheduled',
      };
      //once i have a patient I am able to  create the appoinment
      const newAppointment = await databases.createDocument(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        ID.unique(),
        appointmentToCreate
      );

      revalidatePath('/admin');
      return parseStringify(newAppointment);
    } else {
      throw new Error(
        'That schedule was just taken by another user. Please select another.'
      );
    }
  } catch (error) {
    console.error('An error occurred while creating a new appointment:', error);
    throw error;
  }
};

//  GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc('$createdAt')]
    );

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      completedCount: 0,
      noShowCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case 'scheduled':
            acc.scheduledCount++;
            break;
          case 'completed':
            acc.completedCount++;
            break;
          case 'no-show':
            acc.noShowCount++;
            break;
          case 'pending':
            acc.pendingCount++;
            break;
          case 'cancelled':
            acc.cancelledCount++;
            break;
        }
        return acc;
      },
      initialCounts
    );
    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    };

    return parseStringify(data);
  } catch (error) {
    console.error(
      'An error occurred while retrieving the recent appointments:',
      error
    );
  }
};

//  SEND SMS NOTIFICATION
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    // https://appwrite.io/docs/references/1.5.x/server-nodejs/messaging#createSms
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    console.error('An error occurred while sending sms:', error);
  }
};

//  UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointmentId,
  userId,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    // Update appointment to scheduled -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#updateDocument
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );

    if (!updatedAppointment) throw Error;
    // with Dr. ${appointment.physician}` : `We regret to inform that your appointment
    const smsMessage = `Greetings from MediSchedule. ${
      type === 'schedule'
        ? `Your appointment is confirmed for ${formatDateTime(appointment.schedule!).dateTime} 
    with Dr. ${appointment.professional}`
        : `We regret to inform that your appointment 
    for ${formatDateTime(appointment.schedule!).dateTime} is cancelled. 
    Reason:  ${appointment.cancellationReason}`
    }.`;
    await sendSMSNotification(userId, smsMessage);

    revalidatePath('/admin');
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error('An error occurred while scheduling an appointment:', error);
  }
};

// GET APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      []
    );
    return parseStringify(appointment);
  } catch (error) {
    console.error(
      'An error occurred while retrieving the existing appointment:',
      error
    );
  }
};
//GET APPOINTMENTS OF PATIENT
export const getPatientAppointmentList = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      // PATIENT_COLLECTION_ID!,
      CLIENT_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );

    const patient = patients.documents[0].$id;
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.equal('patient', patient), Query.orderDesc('$createdAt')]
    );
    // return parseStringify(appointment);
    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      completedCount: 0,
      noShowCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case 'scheduled':
            acc.scheduledCount++;
            break;
          case 'completed':
            acc.completedCount++;
            break;
          case 'no-show':
            acc.noShowCount++;
            break;
          case 'pending':
            acc.pendingCount++;
            break;
          case 'cancelled':
            acc.cancelledCount++;
            break;
        }
        return acc;
      },
      initialCounts
    );
    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    };

    return parseStringify(data);
  } catch (error) {
    console.error(
      'An error occurred while retrieving the existing appointment list:',
      error
    );
  }
};
//GET APPOINTMENTS OF DOCTOR
export const getDoctorAppointmentList = async (userId: string) => {
  try {
    const doctors = await databases.listDocuments(
      DATABASE_ID!,
      // DOCTOR_COLLECTION_ID!,
      PROFESSIONAL_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );
    const doctor = doctors.documents[0]?.$id || '';
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.equal('professional', doctor), Query.orderDesc('$createdAt')]
    );
    // return parseStringify(appointments.documents);
    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      completedCount: 0,
      noShowCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case 'scheduled':
            acc.scheduledCount++;
            break;
          case 'completed':
            acc.completedCount++;
            break;
          case 'no-show':
            acc.noShowCount++;
            break;
          case 'pending':
            acc.pendingCount++;
            break;
          case 'cancelled':
            acc.cancelledCount++;
            break;
        }
        return acc;
      },
      initialCounts
    );
    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    };

    return parseStringify(data);
  } catch (error) {
    console.error(
      'An error occurred while retrieving the existing appointment list:',
      error
    );
  }
};
//GET APPOINTMENTS FOR NEXT MONTH
export const getNextMonthsAppointments = async () => {
  try {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.greaterThanEqual('schedule', today.toISOString()),
        Query.lessThanEqual('schedule', nextMonth.toISOString()),
        Query.orderAsc('schedule'),
      ]
    );

    const filteredAppointments = appointments.documents.map(app => ({
      schedule: app.schedule,
      doctorId: app.professional?.$id, // Extract only the doctor ID
    }));
    return parseStringify(filteredAppointments);
  } catch (error) {
    console.error(
      'An error occurred while retrieving the existing appointment list:',
      error
    );
  }
};
