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
import DoctorForm from './forms/DoctorForm';
import { useAuth } from '@/contexts/AuthContext';

export const CreationsModal = ({
  type,
  onCreate,
}: {
  type: 'newUser' | 'newDoctor' | 'newAppointment';
  onCreate?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const { user: authUser } = useAuth();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`capitalize bg-green-500`}>{type}</Button>
      </DialogTrigger>

      <DialogContent className="shad-dialog sm:max-w-md">
        <section className="mb-3">
          <div className="">
            {type == 'newUser' && <h2 className="header">New User</h2>}
            {type == 'newDoctor' && <h2 className="header">New Doctor</h2>}
            {type == 'newAppointment' && (
              <h2 className="header">New Appointment</h2>
            )}
          </div>
        </section>
        <div className="max-h-[450px] overflow-y-auto">
          {type == 'newUser' && (
            <PatientForm setOpen={setOpen} onCreate={onCreate} />
          )}
          {type == 'newDoctor' && (
            <DoctorForm setOpen={setOpen} onCreate={onCreate} />
          )}
          {type == 'newAppointment' && (
            <AppointmentForm
              type="create"
              userId={authUser?.$id}
              setOpen={setOpen}
              onCreate={onCreate}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
