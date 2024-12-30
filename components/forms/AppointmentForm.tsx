'use client';
import React, { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
// import { useRouter } from 'next/navigation';
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
import {
  ActionTypes,
  useGlobalDispatch,
  useGlobalState,
} from '@/contexts/GlobalState';

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
  const [isLoading, setIsLoading] = useState(false);

  const [isFetchingData, setIsFetchingData] = useState(true);
  const [SpecialitysAvaiable, setSpecialityAvaiable] = useState([]);
  const [nextMonthAppintmentList, setNextMonthAppintmentList] = useState([]);

  const nextMonthScheduleAppointmentsOfDoctor = doctor => {
    return nextMonthAppintmentList
      .filter(
        appointment =>
          appointment.doctorId === doctor && appointment.status === 'scheduled'
      )
      .map(appointment => {
        const formattedDate = formatDateTime(appointment.schedule);
        return {
          ...appointment,
          schedule: new Date(formattedDate.dateTime),
        };
      });
  };
  const AppointmentFormValidation = getAppointmentSchema(type);
  const { user: authUser } = useAuth();
  // const isAdmin = localStorage.getItem('accessKey') ? true : false;
  const dispatch = useGlobalDispatch();
  const { doctors } = useGlobalState();
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctors = await getDoctorList();
        dispatch({ type: ActionTypes.SET_DOCTORS, payload: doctors.documents });
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

    const fetchData = async () => {
      // Execute fetches conditionally
      const fetchPromises = [];
      if (!doctors.length) {
        fetchPromises.push(fetchDoctors());
      }
      fetchPromises.push(fetchNextMonthAppointments());

      // Wait for all necessary fetches to complete
      await Promise.all(fetchPromises);

      setIsFetchingData(false);
    };
    if (!type || type == 'create' || type == 're-schedule') {
      fetchData();
    } else {
      setIsFetchingData(false);
    }

    if (!userId) {
      userId = authUser?.$id;
    }
  }, []);
  useEffect(() => {
    if (SpecialitysAvaiable.length == 0 && doctors.length > 0) {
      const doctorSpecialties = doctors.reduce((uniqueSpecialties, doctor) => {
        if (!uniqueSpecialties.includes(doctor.speciality)) {
          uniqueSpecialties.push(doctor.speciality);
        }
        return uniqueSpecialties;
      }, []);
      setSpecialityAvaiable(doctorSpecialties);
    }
  }, [doctors]);
  const formatDateTime = (dateString: Date | string) => {
    const dateTimeOptions: Intl.DateTimeFormatOptions = {
      // weekday: "short", // abbreviated weekday name (e.g., 'Mon')
      month: 'short', // abbreviated month name (e.g., 'Oct')
      day: 'numeric', // numeric day of the month (e.g., '25')
      year: 'numeric', // numeric year (e.g., '2023')
      hour: 'numeric', // numeric hour (e.g., '8')
      minute: 'numeric', // numeric minute (e.g., '30')
      hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    };

    const dateDayOptions: Intl.DateTimeFormatOptions = {
      weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
      year: 'numeric', // numeric year (e.g., '2023')
      month: '2-digit', // abbreviated month name (e.g., 'Oct')
      day: '2-digit', // numeric day of the month (e.g., '25')
    };

    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short', // abbreviated month name (e.g., 'Oct')
      year: 'numeric', // numeric year (e.g., '2023')
      day: 'numeric', // numeric day of the month (e.g., '25')
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric', // numeric hour (e.g., '8')
      minute: 'numeric', // numeric minute (e.g., '30')
      hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    };

    const formattedDateTime: string = new Date(dateString).toLocaleString(
      'en-US',
      dateTimeOptions
    );

    const formattedDateDay: string = new Date(dateString).toLocaleString(
      'en-US',
      dateDayOptions
    );

    const formattedDate: string = new Date(dateString).toLocaleString(
      'en-US',
      dateOptions
    );

    const formattedTime: string = new Date(dateString).toLocaleString(
      'en-US',
      timeOptions
    );

    return {
      dateTime: formattedDateTime,
      dateDay: formattedDateDay,
      dateOnly: formattedDate,
      timeOnly: formattedTime,
    };
  };
  function normalizeDate(date: Date) {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
  }

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
      professional: appointment ? appointment?.professional.$id : '',
      schedule: appointment
        ? roundedSchedule(new Date(appointment?.schedule!))
        : roundedSchedule(new Date(Date.now())),
      reason: appointment ? appointment.reason : '',
      note: appointment?.note || '',
      cancellationReason: appointment?.cancellationReason || '',
      result: appointment?.result || '',
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
    const dr = doctors.filter(doctor => doctor.$id === selectedDoctor);

    form.setValue('schedule', nextSlotsForDoctor(dr[0]));
  };
  const handleSpecialityChange = selectedSpeciality => {
    form.setValue('speciality', selectedSpeciality);
  };
  const handleAsapChange = selectedAsap => {
    form.setValue('asap', selectedAsap);
  };

  const handleAsapOrSpecialityChange = () => {
    if (asap && speciality) {
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
  useEffect(() => {
    handleAsapOrSpecialityChange();
  }, [asap, speciality]);

  const isDateTimeTaken = time => {
    try {
      const dateToCheck = time;

      if (isNaN(dateToCheck.getTime())) {
        console.error('Invalid date format for time:', time);
        return false; // Return false if the input is invalid
      }

      const isOnArray = nextMonthScheduleAppointmentsOfDoctor(
        selectedDoctor
      ).some(appt => {
        if (!appt.schedule) return null;
        const apptDate = new Date(appt.schedule);

        if (isNaN(apptDate.getTime())) {
          console.error('Invalid date format in appointment:', appt.schedule);
          return false; // Skip invalid appointment dates
        }

        return dateToCheck.getTime() === apptDate.getTime();
      });

      if (isOnArray) {
        console.log('Date/time is taken:', dateToCheck);
      }
      return isOnArray;
    } catch (error) {
      console.error('Error in isDateTimeTaken:', error);
      return false; // Fallback in case of unexpected errors
    }
  };

  const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
  const now = new Date(new Date().setMonth(new Date().getMonth()));

  const filter = (date: Date): boolean => {
    if (!selectedDoctor || !doctors.length) return true;

    // Find the selected doctor's data
    const doctor = doctors.find(doctor => doctor.$id === selectedDoctor);

    if (!doctor || !doctor.weeklyAvailability) return true;

    // Parse the doctor's weekly availability
    // const weeklyAvailability = JSON.parse(doctor.weeklyAvailability);
    let weeklyAvailability;
    try {
      weeklyAvailability = JSON.parse(doctor.weeklyAvailability);
    } catch (error) {
      console.error('Error parsing weekly availability:', error);
      return true;
    }

    // Get the day of the week for the selected date
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

    // Find the availability for the selected day
    const availabilityForDay = weeklyAvailability.find(
      (day: { day: string }) => day.day === dayOfWeek
    );

    // If the day is not in the availability, disable it
    if (!availabilityForDay) return false;

    if (
      normalizeDate(date) > normalizeDate(maxDate) ||
      normalizeDate(date) < normalizeDate(now)
    ) {
      return false;
    } else {
      return true;
    }
  };

  //day
  const dayClassName = (date: Date): string => {
    if (!selectedDoctor || !doctors.length) return 'selectable-day';

    // Find the selected doctor's data
    const doctor = doctors.find(doctor => doctor.$id === selectedDoctor);
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

    if (
      normalizeDate(date) > normalizeDate(maxDate) ||
      normalizeDate(date) < normalizeDate(now)
    ) {
      return 'non-selectable-day';
    } else {
      return 'selectable-day';
    }
  };
  /////time

  const isTimeSelectable = (time: Date): boolean => {
    if (!selectedDate || !selectedDoctor || !doctors.length) return true;

    // Find the selected doctor's data
    const doctor = doctors.find(doctor => doctor.$id === selectedDoctor);

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

    const isTaken = isDateTimeTaken(time);

    if (isTaken) {
      return false;
    }
    // console.log('false', isTaken);
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
    if (!selectedDate || !selectedDoctor || !doctors.length)
      return 'selectable-time';

    // Find the selected doctor's data
    const doctor = doctors.find(doctor => doctor.$id === selectedDoctor);

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

    const isTaken = isDateTimeTaken(time);

    if (isTaken) {
      return 'non-selectable-time';
    }

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
    const filteredDoctors = doctors.filter(
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
    const today = roundedSchedule(new Date());
    if (!doctor || !doctor.weeklyAvailability) return null;

    // Parse the doctor's weekly availability
    const weeklyAvailability = JSON.parse(doctor.weeklyAvailability);

    const findNextAvailableSlot = (startDate, availability) => {
      const start = new Date(
        startDate.toDateString() + ' ' + availability.startTime
      );
      const end = new Date(
        startDate.toDateString() + ' ' + availability.endTime
      );
      const roundedStartDate = roundedSchedule(startDate);

      // const roundedStartDate = startDate;
      let nextSlot;
      if (roundedStartDate < start) {
        nextSlot = start;
      } else {
        nextSlot = roundedStartDate;
      }

      while (nextSlot <= end) {
        const isTaken = isDateTimeTaken(nextSlot);
        if (!isTaken) {
          return nextSlot; // Return the first available slot
        }

        nextSlot.setMinutes(nextSlot.getMinutes() + 30);
      }
      return null; // No slot found for this availability
    };

    const getNextAvailableDay = (startDate, offsetDays) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + offsetDays);
      return date;
    };

    // Check for availability starting today and loop over future weeks
    const MAX_WEEKS_TO_SEARCH = 4; // Limit the search to 6 weeks in the future
    const DAYS_IN_WEEK = 7;

    for (let week = 0; week < MAX_WEEKS_TO_SEARCH; week++) {
      for (let day = 0; day < DAYS_IN_WEEK; day++) {
        const searchDate = getNextAvailableDay(
          today,
          week * DAYS_IN_WEEK + day
        );
        // For subsequent days, set the time to the beginning of the day (7 AM or preferred time)
        if (week !== 0 || day !== 0) {
          searchDate.setHours(7, 0, 0, 0);
        }

        const dayOfWeek = searchDate.toLocaleDateString('en-US', {
          weekday: 'long',
        });

        const availabilityForDay = weeklyAvailability.find(
          day => day.day === dayOfWeek
        );
        if (availabilityForDay) {
          const nextSlot = findNextAvailableSlot(
            searchDate,
            availabilityForDay
          );
          if (nextSlot) return nextSlot;
        }
      }
    }

    // No available slots found within the maximum search window
    return null;
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
            result: values.result,
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
  if (isFetchingData)
    return (
      <div className="flex justify-center items-center p-4">
        <Image
          src="/assets/icons/loader.svg"
          alt="loader"
          width={24}
          height={24}
          className="animate-spin"
        />
      </div>
    );

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
                  // form.setValue('speciality', selectedValue);
                  // handleAsapOrSpecialityChange();
                  handleSpecialityChange(selectedValue);
                }}
              >
                {SpecialitysAvaiable &&
                  SpecialitysAvaiable.map((speciality, i) => (
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
                  // form.setValue('asap', selectedValue);
                  // handleAsapOrSpecialityChange();
                  handleAsapChange(selectedValue);
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
                {doctors &&
                  doctors.map((doctor, i) => {
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
        {type === 'complete' && (
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="result"
            label="Comment about the schedule"
            placeholder="Everything OK"
          />
        )}
        <SubmitButton
          disabled={
            (userId &&
              userId === process.env.NEXT_PUBLIC_ADMIN_USER_ID &&
              type === 'create' &&
              !form.getValues('identificationNumber')) ||
            !selectedDoctor ||
            isLoading
          }
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
