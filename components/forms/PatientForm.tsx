'use client';
import { z } from 'zod';
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
import { UserFormValidation } from '@/lib/validation';
import { createUser } from '@/lib/actions/patient.actions';
import { useRouter } from 'next/navigation';
import { PasswordInput } from '../PasswordInput';

export enum FormFieldType {
  INPUT = 'input',
  TEXTAREA = 'textarea',
  PHONE_INPUT = 'phoneinput',
  CHECKBOX = 'checkbox',
  DATE_PICKER = 'datepicker',
  SELECT = 'select',
  SKELETON = 'skeleton',
  PASSWORD_INPUT = 'passwordinput',
}
const PatientForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof UserFormValidation>) => {
    setIsLoading(true);
    try {
      const userData = {
        //name: values.name,
        email: values.email,
        // phone: values.phone,
        password: values.password,
      };
      const user = await createUser(userData); //or getUser if it exist
      if (user && !user.phone) router.push(`/patients/${user.$id}/register`);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
          <h1 className="header">Hi there 👋</h1>
          <p className="text-dark-700">Welcome to our site.</p>
          <p className="text-dark-500">
            Please log in. If you don't have an account yet, please request one
            from CarePulse.
          </p>
        </section>
        {/* <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT}
          name="name"
          label="Full name"
          placeholder="John Doe"
          iconSrc="assets/icons/user.svg"
          iconAlt="user"
        /> */}
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT}
          name="email"
          label="Email"
          placeholder="johndoe@gmail.com"
          iconSrc="assets/icons/email.svg"
          iconAlt="email"
        />
        {/* <CustomFormField
          control={form.control}
          fieldType={FormFieldType.PHONE_INPUT}
          name="phone"
          label="Phone Number"
          placeholder="(555) 123-4567"
        /> */}
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.SKELETON}
          name="password"
          label="Password"
          renderSkeleton={field => (
            <PasswordInput
              id="password"
              value={field.value}
              onChange={field.onChange}
              autoComplete="password"
              className="shad-input border-0"
            />
          )}
        />

        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  );
};

export default PatientForm;
