'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Appointment } from '@/types/appwrite.types';

import AppointmentForm from './forms/AppointmentForm';

import 'react-datepicker/dist/react-datepicker.css';
import PatientForm from './forms/PatientForm';
import RegisterForm from './forms/RegisterForm';
import PassForm from './forms/PassForm';
import DoctorForm from './forms/DoctorForm';
import { getUser } from '@/lib/actions/user.actions';
import { useAuth } from '@/contexts/AuthContext';

export const UpdateModal = ({
  type,
  userId,
}: {
  type: 'changePass' | 'changeDoctor' | 'changePatient';
  userId: string;
}) => {
  const [open, setOpen] = useState(false);
  const { user, login: authLogin } = useAuth();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="capitalize bg-green-500">
          {type === 'changePass' && 'Change Password'}
          {type === 'changeDoctor' && 'Update Info'}
          {type === 'changePatient' && 'Update Info'}
        </Button>
      </DialogTrigger>

      <DialogContent className="shad-dialog sm:max-w-md">
        <section className="mb-3">
          <div className="">
            {type == 'changePass' && (
              <h2 className="header">Change Password</h2>
            )}
            {type == 'changeDoctor' && <h2 className="header">Update Info</h2>}
            {type == 'changePatient' && <h2 className="header">Update Info</h2>}
          </div>
        </section>
        <div className="max-h-[450px] overflow-y-auto">
          {type == 'changePass' && (
            <PassForm
              setOpen={setOpen}
              userId={userId}
              email={user?.email || ''}
            />
          )}
          {type == 'changeDoctor' && (
            <DoctorForm type="update" setOpen={setOpen} user={user} />
          )}
          {type == 'changePatient' && (
            <RegisterForm type="update" setOpen={setOpen} user={user} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
