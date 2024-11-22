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
import { PatientFormValidation } from '@/lib/validation';
import { getUser, registerPatient } from '@/lib/actions/patient.actions';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Doctors,
  GenderOptions,
  IdentificationTypes,
  PatientFormDefaultValues,
} from '@/constants';
import { Label } from '../ui/label';
import { SelectItem } from '../ui/select';
import Image from 'next/image';
import FileUploader from '../FileUploader';
import { z } from 'zod';
import { FormFieldType } from '@/lib/utils';

const DoctorForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      name: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof PatientFormValidation>) => {
    // setIsLoading(true);
    // let formData;
    // if (
    //   values.identificationDocument &&
    //   values.identificationDocument?.length > 0
    // ) {
    //   const blobFile = new Blob([values.identificationDocument[0]], {
    //     type: values.identificationDocument[0].type,
    //   });
    //   formData = new FormData();
    //   formData.append('blobFile', blobFile);
    //   formData.append('fileName', values.identificationDocument[0].name);
    // }
    // try {
    //   const patientData = {
    //     userId: user.$id,
    //     name: values.name,
    //     email: values.email,
    //     phone: values.phone,
    //     birthDate: new Date(values.birthDate),
    //     gender: values.gender,
    //     address: values.address,
    //     occupation: values.occupation,
    //     emergencyContactName: values.emergencyContactName,
    //     emergencyContactNumber: values.emergencyContactNumber,
    //     primaryPhysician: values.primaryPhysician,
    //     insuranceProvider: values.insuranceProvider,
    //     insurancePolicyNumber: values.insurancePolicyNumber,
    //     allergies: values.allergies,
    //     currentMedication: values.currentMedication,
    //     familyMedicalHistory: values.familyMedicalHistory,
    //     pastMedicalHistory: values.pastMedicalHistory,
    //     identificationType: values.identificationType,
    //     identificationNumber: values.identificationNumber,
    //     identificationDocument: values.identificationDocument
    //       ? formData
    //       : undefined,
    //     privacyConsent: values.privacyConsent,
    //   };
    //   const newPatient = await registerPatient(patientData);
    //   if (newPatient) {
    //     router.push(`/patients/${user.$id}/new-appointment`);
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
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
            name="identificationnumber"
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
          name="photo"
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
