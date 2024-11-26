'use server';

import { revalidatePath } from 'next/cache';
import { ID, Permission, Query, Role } from 'node-appwrite';

import { Appointment } from '@/types/appwrite.types';

import {
  APPOINTMENT_COLLECTION_ID,
  PATIENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging,
} from '../appwrite.config';
import { formatDateTime, parseStringify } from '../utils';

//  CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    // first I need to check that there is no appoinment for the same dr in that schedule
    const prevAppointment = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal('physician', appointment.physician),
        Query.equal('schedule', appointment.schedule.toISOString()),
      ]
    );
    if (prevAppointment.documents.length === 0) {
      //I get the patientId from the userId if i dont have a patientId
      if (!appointment.patient) {
        const patients = await databases.listDocuments(
          DATABASE_ID!,
          PATIENT_COLLECTION_ID!,
          [Query.equal('userId', [appointment.userId])]
        );
        if (!patients.documents.length) {
          throw new Error('No patient found for the given user ID.');
        } else {
          appointment.patient = parseStringify(patients.documents[0]);
        }
      }
      //I create the appoinment
      const newAppointment = await databases.createDocument(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        ID.unique(),
        appointment
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

    const smsMessage = `Greetings from CarePulse. ${type === 'schedule' ? `Your appointment is confirmed for ${formatDateTime(appointment.schedule!).dateTime} with Dr. ${appointment.physician}` : `We regret to inform that your appointment for ${formatDateTime(appointment.schedule!).dateTime} is cancelled. Reason:  ${appointment.cancellationReason}`}.`;
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
    const appointment = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.equal('patient', userId), Query.orderDesc('$createdAt')]
    );
    return parseStringify(appointment);
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
        Query.select(['schedule', 'dr']),
      ]
    );
    return parseStringify(appointments);
  } catch (error) {
    console.error(
      'An error occurred while retrieving the existing appointment list:',
      error
    );
  }
};
