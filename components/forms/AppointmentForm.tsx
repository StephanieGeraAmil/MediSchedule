'use client';
import React, { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { effect, z } from 'zod';

import { SelectItem } from '@/components/ui/select';
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
      doctor: appointment ? appointment?.doctor.$id : doctorsList[0]?.$id,
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
    name: 'doctor',
  });
  useEffect(() => {
    console.log(selectedDoctor);
    const doctorAppointments = nextMonthAppintmentList.filter(
      appt => appt.doctorId === selectedDoctor
    );
    console.log(doctorAppointments);
  }, [selectedDoctor]);
  const selectedDate = useWatch({ control: form.control, name: 'schedule' });

  const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
  //day
  const filter = (date: Date): boolean => {
    if (!selectedDoctor || !doctorsList.length) return true;

    // Find the selected doctor's data
    const doctor = doctorsList.find(doctor => doctor.$id === selectedDoctor);

    if (!doctor || !doctor.weeklyAvailability) return true;

    // Parse the doctor's weekly availability
    const weeklyAvailability = JSON.parse(doctor.weeklyAvailability);

    // Get the day of the week for the selected date
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

    // Find the availability for the selected day
    const availabilityForDay = weeklyAvailability.find(
      (day: { day: string }) => day.day === dayOfWeek
    );

    // If the day is not in the availability, disable it
    if (!availabilityForDay) return false;

    // Check if the date is already booked
    // const doctorAppointments = nextMonthAppintmentList.filter(
    //   appt => appt.doctor === selectedDoctor
    // );

    // const isDateTaken = doctorAppointments.some(
    //   appt => new Date(appt.schedule).toDateString() === date.toDateString()
    // );

    // if (isDateTaken || date > maxDate) {
    if (date > maxDate) {
      return false;
    } else {
      return true;
    }
  };

  const dayClassName = (date: Date): string => {
    if (!selectedDoctor || !doctorsList.length) return 'selectable-day';

    // Find the selected doctor's data
    const doctor = doctorsList.find(doctor => doctor.$id === selectedDoctor);
    if (!doctor || !doctor.weeklyAvailability) return 'selectable-day';

    // Parse the doctor's weekly availability
    const weeklyAvailability = JSON.parse(doctor.weeklyAvailability);

    // Get the day of the week for the selected date
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

    // Find the availability for the selected day
    const availabilityForDay = weeklyAvailability.find(
      (day: { day: string }) => day.day === dayOfWeek
    );

    // If the day is not in the availability, mark as unavailable
    if (!availabilityForDay) return 'non-selectable-day';

    // Check if the date is already booked
    // const doctorAppointments = nextMonthAppintmentList.filter(
    //   appt => appt.doctor === selectedDoctor
    // );
    // const isDateTaken = doctorAppointments.some(
    //   appt => new Date(appt.schedule).toDateString() === date.toDateString()
    // );

    // if (isDateTaken || date > maxDate) {
    if (date > maxDate) {
      return 'non-selectable-day';
    } else {
      return 'selectable-day';
    }
  };
  /////time

  const isTimeSelectable = (time: Date): boolean => {
    console.log(time);
    // if (!field.value || !selectedDoctor || !doctorsList.length) return true;
    if (!selectedDate || !selectedDoctor || !doctorsList.length) return true;

    // Find the selected doctor's data
    const doctor = doctorsList.find(doctor => doctor.$id === selectedDoctor);

    if (!doctor || !doctor.weeklyAvailability) return true;

    // Parse the doctor's weekly availability
    const weeklyAvailability = JSON.parse(doctor.weeklyAvailability);

    // Get the day of the week for the selected date
    // const selectedDate = new Date(field.value);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
    });

    // Find the availability for the selected day
    const availabilityForDay = weeklyAvailability.find(
      (day: { day: string }) => day.day === dayOfWeek
    );

    // If the day is not in the availability, return false
    if (!availabilityForDay) return false;

    // Convert start and end times to Date objects for comparison
    const startTime = new Date(
      `${selectedDate.toDateString()} ${availabilityForDay.startTime}`
    );
    const endTime = new Date(
      `${selectedDate.toDateString()} ${availabilityForDay.endTime}`
    );

    // const doctorAppointments = nextMonthAppintmentList.filter(
    //   appt => appt.doctorId === selectedDoctor
    // );
    // console.log('doctorAppointments', doctorAppointments);
    // const isDateTimeTaken = doctorAppointments.some(
    //   appt => new Date(appt.schedule) === time
    // );

    const isDateTimeTaken = nextMonthAppintmentList.filter(appt => {
      const date1 = new Date(time);
      const date2 = new Date(appt.schedule);

      if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        throw new Error('Invalid date format');
      }

      const isSameDoctor = appt.doctorId === selectedDoctor;
      const isSameTime = date1.getTime() === date2.getTime();

      return isSameDoctor && isSameTime;
    });

    if (isDateTimeTaken.length > 0) return false;
    // Disable times outside of the availability range
    if (time >= startTime && time <= endTime) {
      return true;
    } else {
      return false;
    }
    // return true;
  };

  const timeClassName = (time: Date): string => {
    if (!selectedDate || !selectedDoctor || !doctorsList.length)
      return 'selectable-time';

    // Find the selected doctor's data
    const doctor = doctorsList.find(doctor => doctor.$id === selectedDoctor);

    if (!doctor || !doctor.weeklyAvailability) return 'selectable-time';

    // Parse the doctor's weekly availability
    const weeklyAvailability = JSON.parse(doctor.weeklyAvailability);

    // Get the day of the week for the selected date
    // const selectedDate = new Date(field.value);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
    });

    // Find the availability for the selected day
    const availabilityForDay = weeklyAvailability.find(
      (day: { day: string }) => day.day === dayOfWeek
    );

    // If the day is not in the availability, return false
    if (!availabilityForDay) return 'non-selectable-time';

    // Convert start and end times to Date objects for comparison
    const startTime = new Date(
      `${selectedDate.toDateString()} ${availabilityForDay.startTime}`
    );
    const endTime = new Date(
      `${selectedDate.toDateString()} ${availabilityForDay.endTime}`
    );

    const isDateTimeTaken = nextMonthAppintmentList.filter(appt => {
      const date1 = new Date(time);
      const date2 = new Date(appt.schedule);

      if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        throw new Error('Invalid date format');
      }

      const isSameDoctor = appt.doctorId === selectedDoctor;
      const isSameTime = date1.getTime() === date2.getTime();

      return isSameDoctor && isSameTime;
    });
    if (isDateTimeTaken.length > 0) {
      console.log(isDateTimeTaken);
      return 'non-selectable-time';
    }

    // Disable times outside of the availability range
    if (time >= startTime && time <= endTime) {
      return 'selectable-time';
    } else {
      return 'non-selectable-time';
    }
  };

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
        let patientData: Record<string, string> = {};
        if (patientId) {
          patientData.patient = patientId;
          // patientData.userId = userId;
          // } else if (userId) {
          //   //i'm in the patient overview
          //   patientData.userId = userId;
        } else if (values.identificationNumber) {
          patientData.identificationNumber = values.identificationNumber;
          // patientData.userId = userId;
          //i'm in the admin
        }

        const appointmentData = {
          ...patientData,
          // physician: values.physician,
          doctor: values.doctor,
          schedule: new Date(values.schedule),
          reason: values.reason!,
          status: status,
          note: values.note,
          userId: userId ? userId : '',
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
            // physician: values.physician,
            doctor: values.doctor,
            schedule: new Date(values.schedule),
            status: status,
            note: values.note,
            reason: values.reason!,
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
            {userId && userId === process.env.NEXT_PUBLIC_ADMIN_USER_ID && (
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
              isTimeSelectable={isTimeSelectable}
              filterDate={filter}
              dayClassName={dayClassName}
              timeClassName={timeClassName}
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
