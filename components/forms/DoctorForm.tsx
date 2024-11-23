'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import CustomFormField from '../CustomFormField';
import SubmitButton from '../SubmitButton';
import { DoctorFormValidation, PatientFormValidation } from '@/lib/validation';
import { getUser, registerPatient } from '@/lib/actions/patient.actions';
import { createDoctor } from '@/lib/actions/doctor.actions';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Doctors,
  GenderOptions,
  IdentificationTypes,
  DoctorFormDefaultValues,
  AvaiabilityDaysOptions,
  AvaiabilityHoursOptions,
  FormFieldType,
} from '@/constants';
import { Label } from '../ui/label';
import { SelectItem } from '../ui/select';
import Image from 'next/image';
import FileUploader from '../FileUploader';
import { z } from 'zod';
import { Checkbox } from '../ui/checkbox';

interface Availability {
  day: string;
  startTime: string;
  endTime: string;
}

const DoctorForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof DoctorFormValidation>>({
    resolver: zodResolver(DoctorFormValidation),
    defaultValues: {
      ...DoctorFormDefaultValues,
    },
  });

  const onSubmit = async (values: z.infer<typeof DoctorFormValidation>) => {
    console.log('in the submit');
    setIsLoading(true);
    let formData;
    if (values.photoFile && values.photoFile?.length > 0) {
      const blobFile = new Blob([values.photoFile[0]], {
        type: values.photoFile[0].type,
      });
      formData = new FormData();
      formData.append('blobFile', blobFile);
      formData.append('fileName', values.photoFile[0].name);
    }
    try {
      const doctorData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        identificationNumber: values.identificationNumber,
        birthDate: new Date(values.birthDate),
        speciality: values.speciality,
        photoFile: values.photoFile ? formData : undefined,
      };
      console.log(doctorData);
      console.log(values.weeklyAvaiability);
      const newDoctor = await createDoctor(doctorData);
      if (newDoctor) {
        console.log(newDoctor);
      }
    } catch (error) {
      console.log(error);
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
            fieldType={FormFieldType.INPUT}
            name="speciality"
            label="Speciality"
            placeholder="Surgeon"
          />
        </div>
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.SKELETON}
          name="weeklyAvaiability"
          label="Days Avaiable"
          placeholder=""
          renderSkeleton={field => (
            <FormControl>
              <div className="flex gap-6 flex-col">
                {AvaiabilityDaysOptions.map(day => {
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

        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.SKELETON}
          name="photoFile"
          label="Photo"
          placeholder=""
          renderSkeleton={field => (
            <FormControl>
              <FileUploader files={field.value} onChange={field.onChange} />
            </FormControl>
          )}
        />
        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  );
};

export default DoctorForm;
