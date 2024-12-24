'use client';

import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl } from '@/components/ui/form';
import CustomFormField from '../CustomFormField';
import SubmitButton from '../SubmitButton';
import { DoctorFormValidation, PatientFormValidation } from '@/lib/validation';
import {
  createDoctor,
  getDoctor,
  updateDoctor,
} from '@/lib/actions/doctor.actions';
import { useRouter } from 'next/navigation';
import {
  Doctors,
  GenderOptions,
  IdentificationTypes,
  DoctorFormDefaultValues,
  AvailabilityDaysOptions,
  AvailabilityHoursOptions,
  FormFieldType,
  SpecialityList,
} from '@/constants';
import { Label } from '../ui/label';
import FileUploader from '../FileUploader';
import { z } from 'zod';
import { Checkbox } from '../ui/checkbox';
import { SelectItem } from '../ui/select';
import { PasswordInput } from '../PasswordInput';
import { ActionTypes, useGlobalDispatch } from '@/contexts/GlobalState';

interface Availability {
  day: string;
  startTime: string;
  endTime: string;
}

const DoctorForm = ({
  setOpen,
  type,
  user,
}: {
  setOpen?: Dispatch<SetStateAction<boolean>>;
  type?: string;
  user?: User;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const router = useRouter();
  const dispatch = useGlobalDispatch();
  const form = useForm<z.infer<typeof DoctorFormValidation>>({
    resolver: zodResolver(DoctorFormValidation),
    defaultValues: {
      ...DoctorFormDefaultValues,
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const savedDoctor = await getDoctor(user?.$id);
        setDoctor(savedDoctor);
      } catch (error) {
        console.error('Error fetching the doctor:', error);
      }
    };
    if (type) {
      fetchDoctor();
    }
  }, []);

  useEffect(() => {
    if (doctor) {
      const parsedAvailability = doctor.weeklyAvailability
        ? JSON.parse(doctor.weeklyAvailability)
        : [];
      form.reset({
        name: doctor.name || user?.name || '',
        email: doctor.email || user?.email || '',
        phone: doctor.phone || user?.phone || '',
        birthDate: doctor.birthDate || '',
        speciality: doctor.speciality || '',
        identificationNumber: doctor.identificationNumber || '',
        weeklyAvailability: parsedAvailability,
      });
    } else {
      form.reset(DoctorFormDefaultValues);
    }
  }, [doctor]);

  const onSubmit = async (values: z.infer<typeof DoctorFormValidation>) => {
    setIsLoading(true);
    let formData;
    if (!type && values.photoFile && values.photoFile?.length > 0) {
      const blobFile = new Blob([values.photoFile[0]], {
        type: values.photoFile[0].type,
      });
      formData = new FormData();
      formData.append('blobFile', blobFile);
      formData.append('fileName', values.photoFile[0].name);
    }
    try {
      const availabilityString = JSON.stringify(values.weeklyAvailability);
      const doctorData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        identificationNumber: values.identificationNumber,
        birthDate: new Date(values.birthDate),
        speciality: values.speciality,
        weeklyAvailability: availabilityString,
      };
      let doctorToSave;
      if (!type) {
        doctorToSave = {
          ...doctorData,
          photoFile: values.photoFile ? formData : undefined,
          password: values.password,
        };
        const newDoctor = await createDoctor(doctorToSave);
        if (newDoctor) {
          setOpen && setOpen(false);
          form.reset();
          // onCreate && onCreate();
          dispatch({
            type: ActionTypes.CREATE_DOCTOR,
            payload: newDoctor,
          });
        }
      } else {
        if (doctor) {
          doctorToSave = {
            doctorId: doctor.$id || '',
            user: user,
            ...doctorData,
          };

          const updatedDoctor = await updateDoctor(doctorToSave);
          if (updatedDoctor) {
            setOpen && setOpen(false);
            dispatch({
              type: ActionTypes.UPDATE_DOCTOR,
              payload: updatedDoctor,
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 flex-1">
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT}
          name="name"
          label="Full Name"
          placeholder="John Doe"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="email"
            label="Email address"
            placeholder="johndoe@gmail.com"
            iconSrc="/assets/icons/email.svg"
            iconAlt="email"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.PHONE_INPUT}
            name="phone"
            label="Phone number"
            placeholder="(555) 123-4567"
          />
        </div>
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.DATE_PICKER}
          name="birthDate"
          label="Date of Birth"
        />
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="identificationNumber"
            label="Identification Number"
            placeholder="123456789"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            name="speciality"
            label="Speciality"
            placeholder="Select a Speciality"
          >
            {SpecialityList.map(speciality => (
              <SelectItem key={speciality} value={speciality}>
                <div className="flex cursor-pointer items-center gap-2">
                  <p>{speciality}</p>
                </div>
              </SelectItem>
            ))}
          </CustomFormField>
        </div>
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.SKELETON}
          name="weeklyAvailability"
          label="Days Avaiable"
          placeholder=""
          renderSkeleton={field => (
            <FormControl>
              <div className="flex gap-6 flex-col">
                {AvailabilityDaysOptions.map(day => {
                  const isChecked = (field.value || []).some(
                    (a: Availability) => a.day === day
                  );

                  const handleTimeChange = (
                    timeField: 'startTime' | 'endTime',
                    value: string
                  ) => {
                    const currentAvailability = field.value || [];
                    const updatedAvailability = currentAvailability.map(
                      (a: Availability) =>
                        a.day === day ? { ...a, [timeField]: value } : a
                    );
                    field.onChange(updatedAvailability);
                  };
                  const handleCheckedChange = () => {
                    const currentAvailability = field.value || [];
                    const updatedAvailability = isChecked
                      ? currentAvailability.filter(
                          (a: Availability) => a.day !== day
                        )
                      : [
                          ...currentAvailability,
                          { day, startTime: '08:00', endTime: '17:30' },
                        ];
                    field.onChange(updatedAvailability);
                  };

                  return (
                    <div key={day} className="flex justify-between">
                      <div className="flex items-center space-x-2 radio-group">
                        <Checkbox
                          id={day}
                          checked={isChecked}
                          className="w-6 h-6 rounded-full border border-gray-400 roundedCheckbox"
                          onCheckedChange={handleCheckedChange}
                        />
                        <Label htmlFor={day} className="cursor-pointer">
                          {day}
                        </Label>
                        {isChecked && (
                          <div className="flex flex-row justify-end w-full gap-4">
                            <div>
                              <label
                                htmlFor={`start-time-${day}`}
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              >
                                Start time:
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                  <svg
                                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      fill-rule="evenodd"
                                      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                      clip-rule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <input
                                  type="time"
                                  id={`start-time-${day}`}
                                  className=" border leading-none  text-sm rounded-lg w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  min="07:00"
                                  max="22:00"
                                  defaultValue="08:00"
                                  required
                                  value={
                                    field.value.find(
                                      (a: Availability) => a.day === day
                                    )?.startTime || ''
                                  }
                                  onChange={e =>
                                    handleTimeChange(
                                      'startTime',
                                      e.target.value
                                    )
                                  }
                                  step={1800}
                                />
                              </div>
                            </div>
                            <div>
                              <label
                                htmlFor={`end-time-${day}`}
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              >
                                End time:
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                  <svg
                                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      fill-rule="evenodd"
                                      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                      clip-rule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <input
                                  type="time"
                                  id={`end-time-${day}`}
                                  className=" border leading-none  text-sm rounded-lg w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  min="07:00"
                                  max="22:00"
                                  defaultValue="08:00"
                                  required
                                  value={
                                    field.value.find(
                                      (a: Availability) => a.day === day
                                    )?.endTime || ''
                                  }
                                  onChange={e =>
                                    handleTimeChange('endTime', e.target.value)
                                  }
                                  step={1800}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </FormControl>
          )}
        />
        {!type && (
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.SKELETON}
            name="photoFile"
            label="Photo"
            renderSkeleton={field => (
              <FormControl>
                <FileUploader files={field.value} onChange={field.onChange} />
              </FormControl>
            )}
          />
        )}
        {!type && (
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.SKELETON}
            name="password"
            label="Initial Password"
            renderSkeleton={field => (
              <PasswordInput
                id="password"
                value={field.value}
                onChange={field.onChange}
                autoComplete="password"
                className="shad-input border-2"
              />
            )}
          />
        )}
        <SubmitButton isLoading={isLoading}>Save</SubmitButton>
      </form>
    </Form>
  );
};

export default DoctorForm;
