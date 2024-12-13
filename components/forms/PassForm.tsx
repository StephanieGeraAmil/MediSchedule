'use client';
import { z } from 'zod';
import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
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
import { PassFormValidation } from '@/lib/validation';
import { changePassword } from '@/lib/actions/user.actions';
import { useRouter } from 'next/navigation';
import { FormFieldType } from '@/constants';
import { PasswordInput } from '../PasswordInput';

const PassForm = ({
  setOpen,
  userId,
  email,
}: {
  setOpen?: Dispatch<SetStateAction<boolean>>;
  userId: string;
  email: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof PassFormValidation>>({
    resolver: zodResolver(PassFormValidation),
    defaultValues: {
      oldPassword: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof PassFormValidation>) => {
    console.log('here');
    setIsLoading(true);
    try {
      const userData = {
        id: userId,
        email: email,
        oldPassword: values.oldPassword,
        password: values.password,
      };
      console.log(userData);
      const user = await changePassword(userData);
      console.log(user);
      if (user) {
        setOpen && setOpen(false);
        form.reset();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.SKELETON}
          name="oldPassword"
          label="Old Password"
          renderSkeleton={field => (
            <PasswordInput
              id="oldPassword"
              value={field.value || ''}
              onChange={field.onChange}
              autoComplete="password"
              className="shad-input border-2"
            />
          )}
        />
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.SKELETON}
          name="password"
          label="New Password"
          renderSkeleton={field => (
            <PasswordInput
              id="password"
              value={field.value || ''}
              onChange={field.onChange}
              autoComplete="password"
              className="shad-input border-2"
            />
          )}
        />

        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  );
};

export default PassForm;
