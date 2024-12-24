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
import { FormFieldType, SpecialityList } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { ActionTypes, useGlobalDispatch } from '@/contexts/GlobalState';

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
  const { user: authUser } = useAuth();
  // const isAdmin = localStorage.getItem('accessKey') ? true : false;
  const dispatch = useGlobalDispatch();

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
    if (!userId) {
      userId = authUser?.$id;
    }
  }, []);
  const roundedSchedule = (date: Date) => {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 30) * 30;
    date.setMinutes(roundedMinutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  };
  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      professional: appointment
        ? appointment?.professional.$id
        : doctorsList[0]?.$id,
      schedule: appointment
        ? roundedSchedule(new Date(appointment?.schedule!))
        : roundedSchedule(new Date(Date.now())),
      reason: appointment ? appointment.reason : '',
      note: appointment?.note || '',
      cancellationReason: appointment?.cancellationReason || '',
      identificationNumber: '',
    },
  });

  const selectedDoctor = useWatch({
    control: form.control,
    name: 'professional',
  });
  const selectedDate = useWatch({ control: form.control, name: 'schedule' });
  const speciality = useWatch({ control: form.control, name: 'speciality' });
  const asap = useWatch({ control: form.control, name: 'asap' });

  const handleDoctorChange = selectedDoctor => {
    form.setValue('asap', false);
    const dr = doctorsList.filter(doctor => doctor.$id === selectedDoctor);

    form.setValue('schedule', nextSlotsForDoctor(dr[0]));
  };

  const handleAsapOrSpecialityChange = () => {
    if (!asap && speciality) {
      const { doctor: earliestDoctor, date: earliestDate } =
        findEarliestAvailableDoctorAndDate(speciality);
      if (earliestDoctor) {
        form.setValue('professional', earliestDoctor.$id);
      }
      if (earliestDate) {
        form.setValue('schedule', earliestDate);
      }
    }
  };

  const isDateTimeTaken = (doctor, time) => {
    return nextMonthAppintmentList.find(appt => {
      const date1 = new Date(time);
      const date2 = new Date(appt.schedule);

      if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        throw new Error('Invalid date format');
      }

      const isSameDoctor = appt.doctorId === doctor;
      const isSameTime = date1.getTime() === date2.getTime();

      return isSameDoctor && isSameTime;
    });
  };

  const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
  const now = new Date(new Date().setMonth(new Date().getMonth()));

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

    if (date > maxDate || date < now) {
      return false;
    } else {
      return true;
    }
  };

  //day
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

    if (date > maxDate || date < now) {
      return 'non-selectable-day';
    } else {
      return 'selectable-day';
    }
  };
  /////time

  const isTimeSelectable = (time: Date): boolean => {
    // if (!field.value || !selectedDoctor || !doctorsList.length) return true;
    if (!selectedDate || !selectedDoctor || !doctorsList.length) return true;

    // Find the selected doctor's data
    const doctor = doctorsList.find(doctor => doctor.$id === selectedDoctor);

    if (!doctor || !doctor.weeklyAvailability) return true;

    // Parse the doctor's weekly availability
    const weeklyAvailability = JSON.parse(doctor.weeklyAvailability);

    // Get the day of the week for the selected date
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

    const isTaken = isDateTimeTaken(selectedDoctor, time);
    if (isTaken) return false;
    //Disable times outside of the availability range
    const nowValue = now.getTime();
    const timeValue = time.getTime();
    if (timeValue > nowValue && time >= startTime && time <= endTime) {
      return true;
    } else {
      return false;
    }
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

    const isTaken = isDateTimeTaken(selectedDoctor, time);
    if (isTaken) return 'non-selectable-time';

    //Disable times outside of the availability range
    const nowValue = now.getTime();
    const timeValue = time.getTime();
    if (timeValue > nowValue && time >= startTime && time <= endTime) {
      return 'selectable-time';
    } else {
      return 'non-selectable-time';
    }
  };

  const findEarliestAvailableDoctorAndDate = speciality => {
    // Filter doctors by the selected speciality
    const filteredDoctors = doctorsList.filter(
      doctor => doctor.speciality === speciality
    );
    //for each doctor get the next slot avaiable
    const nextSlotsForDoctors = filteredDoctors.map(doctor => {
      return {
        doctor: doctor, // Return the doctor object
        slot: nextSlotsForDoctor(doctor), // Get the next available slot
      };
    });

    nextSlotsForDoctors.sort((a, b) => a.slot - b.slot);

    const selectedDoctor = nextSlotsForDoctors[0].doctor;
    const date = nextSlotsForDoctors[0].slot;
    return { doctor: selectedDoctor, date: date };
  };
  const nextSlotsForDoctor = doctor => {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    if (!doctor || !doctor.weeklyAvailability) return today;
    // Get the doctor's weekly availability
    const weeklyAvailability = JSON.parse(doctor.weeklyAvailability);

    // Find the availability for today and future days
    const todayAvailability = weeklyAvailability.find(
      day => day.day === dayOfWeek
    );

    // Check for the next available slot
    let nextAvailableSlot = null;
    if (todayAvailability) {
      const todayStart = new Date(
        today.toDateString() + ' ' + todayAvailability.startTime
      );
      const todayEnd = new Date(
        today.toDateString() + ' ' + todayAvailability.endTime
      );

      // If it's today, we need to find the earliest available time after the current time

      if (today > todayStart && today < todayEnd) {
        nextAvailableSlot = roundedSchedule(new Date(today));
        while (nextAvailableSlot <= todayEnd) {
          const isTaken = isDateTimeTaken(doctor, nextAvailableSlot);
          if (!isTaken) break; // If the time is not taken, break the loop
          nextAvailableSlot.setMinutes(nextAvailableSlot.getMinutes() + 30); // Try next slot
        }
      }
    }

    if (!nextAvailableSlot) {
      // If no available slot today, find the next available day
      for (let i = 1; i < 7; i++) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i);
        const nextDayOfWeek = nextDay.toLocaleDateString('en-US', {
          weekday: 'long',
        });

        const availabilityForNextDay = weeklyAvailability.find(
          day => day.day === nextDayOfWeek
        );
        if (availabilityForNextDay) {
          nextAvailableSlot = new Date(
            nextDay.toDateString() + ' ' + availabilityForNextDay.startTime
          );
          break;
        }
      }
    }

    // Return the earliest available slot
    return nextAvailableSlot;
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
        } else if (values.identificationNumber) {
          patientData.identificationNumber = values.identificationNumber;
        }

        const appointmentData = {
          ...patientData,
          professional: values.professional,
          schedule: new Date(values.schedule),
          reason: values.reason!,
          status: status,
          note: values.note,
          userId: userId ? userId : '',
        };

        const newAppointment = await createAppointment(appointmentData);

        if (newAppointment) {
          dispatch({
            type: ActionTypes.CREATE_APPOINTMENT,
            payload: newAppointment,
          });
          form.reset();
          if (setOpen) setOpen(false);

          // router.push(`/patients/${userId}/new-appointment/success?appointmentId=${newAppointment.$id}`);
        }
      } else {
        // Update appointment logic
        const appointmentToUpdate = {
          appointmentId: appointment?.$id!,
          appointment: {
            professional: values.professional,
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
          dispatch({
            type: ActionTypes.UPDATE_APPOINTMENT,
            payload: updatedAppointment,
          });
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
            {userId &&
              userId === process.env.NEXT_PUBLIC_ADMIN_USER_ID &&
              type === 'create' && (
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="identificationNumber"
                  label="Patient Identification Number"
                  placeholder="123456789"
                />
              )}
            {userId && (
              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="speciality"
                label="Speciality"
                placeholder="Select a speciality"
                onChange={selectedValue => {
                  handleAsapOrSpecialityChange();
                }}
              >
                {SpecialityList &&
                  SpecialityList.map((speciality, i) => (
                    <SelectItem key={speciality + i} value={speciality}>
                      <div className="flex cursor-pointer items-center gap-2">
                        <p> {speciality}</p>
                      </div>
                    </SelectItem>
                  ))}
              </CustomFormField>
            )}
            {userId && (
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.CHECKBOX}
                name="asap"
                label="Select earliest available doctor"
                disabled={!speciality}
                hidden={!speciality}
                onChange={selectedValue => {
                  handleAsapOrSpecialityChange();
                }}
              />
            )}
            {userId && (
              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="professional"
                label="Doctor"
                placeholder="Select a doctor"
                onChange={selectedValue => {
                  handleDoctorChange(selectedValue);
                }}
              >
                {doctorsList &&
                  doctorsList.map((doctor, i) => {
                    if (
                      (speciality && speciality === doctor.speciality) ||
                      !speciality
                    ) {
                      return (
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
                            <p> - {doctor.speciality}</p>
                          </div>
                        </SelectItem>
                      );
                    }
                    return null;
                  })}
              </CustomFormField>
            )}
            {userId && (
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
            )}
            {userId && (
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
            )}
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
          disabled={!selectedDoctor || isLoading}
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
