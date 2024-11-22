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
              <div className="flex gap-6 xl:justify-between flex-wrap">
                {AvaiabilityDaysOptions.map(option => (
                  <div
                    key={option}
                    className="flex items-center space-x-2 radio-group"
                  >
                    <Checkbox
                      id={option}
                      checked={field.value?.includes(option) || false}
                      className="w-6 h-6 rounded-full border border-gray-400 roundedCheckbox"
                      onCheckedChange={checked => {
                        const updatedValue = checked
                          ? [...(field.value || []), option]
                          : (field.value || []).filter(val => val !== option);
                        field.onChange(updatedValue);
                      }}
                    />
                    <Label htmlFor={option} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </FormControl>
          )}
        />
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.SKELETON}
          name="hourlylyAvaiability"
          label="Hours Avaiable"
          placeholder=""
          renderSkeleton={field => (
            <FormControl>
              <div className="flex gap-6 xl:justify-between flex-wrap">
                {AvaiabilityHoursOptions.map(option => (
                  <div
                    key={option}
                    className="flex items-center space-x-2 radio-group"
                  >
                    <Checkbox
                      id={option}
                      checked={field.value?.includes(option) || false}
                      className="w-6 h-6 rounded-full border border-gray-400 roundedCheckbox"
                      onCheckedChange={checked => {
                        const updatedValue = checked
                          ? [...(field.value || []), option]
                          : (field.value || []).filter(val => val !== option);
                        field.onChange(updatedValue);
                      }}
                    />
                    <Label htmlFor={option} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
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
