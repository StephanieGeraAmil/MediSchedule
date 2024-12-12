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
import { LoginValidation, UserFormValidation } from '@/lib/validation';
import { getPatient, login } from '@/lib/actions/patient.actions';
import { getDoctor } from '@/lib/actions/doctor.actions';
import { useRouter } from 'next/navigation';
import { PasswordInput } from '../PasswordInput';
import { FormFieldType } from '@/constants';

const UserForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof LoginValidation>>({
    resolver: zodResolver(LoginValidation),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginValidation>) => {
    setIsLoading(true);
    try {
      const userData = {
        email: values.email,
        password: values.password,
      };
      const user = await login(userData);
      if (!user) {
        throw new Error('Invalid credentials');
      } else {
        const patient = await getPatient(user.$id);
        if (patient) {
          router.push(`/patients/${user.$id}`);
        } else {
          const doctor = await getDoctor(user.$id);
          if (doctor) {
            router.push(`/doctors/${user.$id}`);
          } else {
            router.push(`/patients/${user.$id}/register`);
          }
        }
      }
    } catch (error: any) {
      form.setError('password', {
        type: 'server',
        message: error.message || 'An unexpected error occurred.',
      });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
          <h1 className="header">Hi there 👋</h1>
          <p className="text-dark-700">Welcome to our site.</p>
          <p className="text-dark-700">
            Please log in. If you don't have an account yet, please request one
            from MediSchedule. (In this testing environment, the admin passkey
            is 123456.)
          </p>
        </section>
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT}
          name="email"
          label="Email"
          placeholder="johndoe@gmail.com"
          iconSrc="assets/icons/email.svg"
          iconAlt="email"
        />
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

export default UserForm;
