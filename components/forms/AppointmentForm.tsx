'use client';
import React, { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { effect, z } from 'zod';

import { SelectItem } from '@/components/ui/select';
import { Doctors } from '@/constants';
import {
  createAppointment,
  getNextMonthsAppointments,
  updateAppointment,
} from '@/lib/actions/appointment.actions';
import { getDoctorList } from '@/lib/actions/doctor.actions';
import { getAppointmentSchema } from '@/lib/validation';
import { Appointment } from '@/types/appwrite.types';

import 'react-datepicker/dist/react-datepicker.css';

import CustomFormField from '../CustomFormField';
import SubmitButton from '../SubmitButton';
import { Form } from '../ui/form';
import { FormFieldType } from '@/constants';

const AppointmentForm = ({
  userId,
  patientId,
  type = 'create',
  appointment,
  setOpen,
}: {
  userId?: string;
  patientId?: string;
  type: 'create' | 're-schedule' | 'cancel' | 'complete' | 'no-show';
  appointment?: Appointment;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [nextMonthAppintmentList, setNextMonthAppintmentList] = useState([]);
  const AppointmentFormValidation = getAppointmentSchema(type);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctors = await getDoctorList();
        setDoctorsList(doctors.documents);
      } catch (error) {
        console.error('Error fetching doctors list:', error);
      }
    };

    const fetchNextMonthAppointments = async () => {
      try {
        const appointments = await getNextMonthsAppointments();
        setNextMonthAppintmentList(appointments);

        console.log(appointments);
      } catch (error) {
        console.error('Error fetching nex month appintment list:', error);
      }
    };
    fetchDoctors();
    fetchNextMonthAppointments();
  }, []);

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      physician: appointment ? appointment?.physician : '',
      doctor: appointment ? appointment?.doctor : doctorsList[0]?.name,
      schedule: appointment
        ? new Date(appointment?.schedule!)
        : new Date(Date.now()),
      reason: appointment ? appointment.reason : '',
      note: appointment?.note || '',
      cancellationReason: appointment?.cancellationReason || '',
      identificationNumber: '',
    },
  });
  const selectedDoctor = useWatch({
    control: form.control,
    name: 'doctor', // The field you want to watch
  });
  // useEffect(() => {
  //   console.log('Doctor selected:', selectedDoctor);
  //   // Additional logic if needed when doctor changes
  // }, [selectedDoctor]);
  //filter function for the datepicker
  const filter = (date: Date): boolean => {
    if (!selectedDoctor || !nextMonthAppintmentList.length) return true;
    // Disable dates already booked for the selected doctor
    const doctorAppointments = nextMonthAppintmentList.filter(
      appt => appt.doctorId === selectedDoctor
    );
    console.log(doctorAppointments);
    const isDateTaken = doctorAppointments.some(
      appt => new Date(appt.schedule).toDateString() === date.toDateString()
    );

    return !isDateTaken;
  };
  const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 1));

  const onSubmit = async (
    values: z.infer<typeof AppointmentFormValidation>
  ) => {
    setIsLoading(true);

    let status: Status;
    switch (type) {
      case 're-schedule':
        status = 'scheduled';
        break;
      case 'cancel':
        status = 'cancelled';
        break;
      case 'no-show':
        status = 'no-show';
        break;
      case 'complete':
        status = 'completed';
        break;
      default:
        status = 'scheduled';
    }

    try {
      if (type === 'create') {
        console.log('in create appointment form');
        console.log(values.identificationNumber);
        let patientData: Record<string, string> = {};
        if (patientId) {
          patientData.patient = patientId;
        } else if (userId) {
          //i'm in the patient overview
          patientData.userId = userId;
        } else if (values.identificationNumber) {
          patientData.identificationNumber = values.identificationNumber;
          //i'm in the admin
        }

        const appointmentData = {
          ...patientData,
          physician: values.physician,
          doctor: values.doctor,
          schedule: new Date(values.schedule),
          reason: values.reason!,
          status: status,
          note: values.note,
        };
        console.log(appointmentData);

        const newAppointment = await createAppointment(appointmentData);

        if (newAppointment) {
          form.reset();
          if (setOpen) setOpen(false);
          // router.push(`/patients/${userId}/new-appointment/success?appointmentId=${newAppointment.$id}`);
        }
      } else {
        // Update appointment logic
        const appointmentToUpdate = {
          // userId,
          appointmentId: appointment?.$id!,
          appointment: {
            physician: values.physician,
            doctor: values.doctor,
            schedule: new Date(values.schedule),
            status: status,
            cancellationReason: values.cancellationReason,
          },
          type,
        };

        const updatedAppointment = await updateAppointment(appointmentToUpdate);

        if (updatedAppointment) {
          setOpen && setOpen(false);
          form.reset();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  let buttonLabel;
  switch (type) {
    case 'cancel':
      buttonLabel = 'Cancel Appointment';
      break;
    case 're-schedule':
      buttonLabel = 'Schedule Appointment';
      break;
    case 'no-show':
      buttonLabel = 'No-Show';
      break;
    case 'complete':
      buttonLabel = 'Completed';
      break;
    default:
      buttonLabel = 'Schedule Apppointment';
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        {!['cancel', 'complete', 'no-show'].includes(type) && (
          <>
            {!userId && (
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="identificationNumber"
                label="Patient Identification Number"
                placeholder="123456789"
              />
            )}

            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="physician"
              label="Doctor old"
              placeholder="Select a doctor"
            >
              {Doctors.map((doctor, i) => (
                <SelectItem key={doctor.name + i} value={doctor.name}>
                  <div className="flex cursor-pointer items-center gap-2">
                    <Image
                      src={doctor.image}
                      width={32}
                      height={32}
                      alt="doctor"
                      className="rounded-full border border-dark-500"
                    />
                    <p>{doctor.name}</p>
                  </div>
                </SelectItem>
              ))}
            </CustomFormField>
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="doctor"
              label="Doctor"
              placeholder="Select a doctor"
            >
              {doctorsList &&
                doctorsList.map((doctor, i) => (
                  <SelectItem key={doctor.name + i} value={doctor.$id}>
                    <div className="flex cursor-pointer items-center gap-2">
                      <Image
                        src={doctor.photoFileUrl}
                        width={32}
                        height={32}
                        alt="doctor"
                        className="rounded-full border border-dark-500"
                      />
                      <p>{doctor.name}</p>
                    </div>
                  </SelectItem>
                ))}
            </CustomFormField>

            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Expected appointment date"
              showTimeSelect
              dateFormat="MM/dd/yyyy  -  h:mm aa"
              maxDate={maxDate}
              filterDate={filter}
            />

            <div
              className={`flex flex-col gap-6  ${type === 'create' && 'xl:flex-row'}`}
            >
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="reason"
                label="Appointment reason"
                placeholder="Annual montly check-up"
                disabled={type === 're-schedule'}
              />

              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="note"
                label="Comments/notes"
                placeholder="Prefer afternoon appointments, if possible"
                disabled={type === 're-schedule'}
              />
            </div>
          </>
        )}

        {type === 'cancel' && (
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="Reason for cancellation"
            placeholder="Urgent meeting came up"
          />
        )}

        <SubmitButton
          isLoading={isLoading}
          className={`${['cancel', 'no-show'].includes(type) ? 'shad-danger-btn' : 'shad-primary-btn'} w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};

export default AppointmentForm;
