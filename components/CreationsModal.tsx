'use client';

import { useState } from 'react';

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

export const CreationsModal = ({
  type,
  userId,
}: {
  type: 'newUser' | 'newDoctor' | 'newAppointment';
  userId?: string;
}) => {
  const [open, setOpen] = useState(false);

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
          {type == 'newUser' && <PatientForm setOpen={setOpen} />}
          {type == 'newDoctor' && <DoctorForm setOpen={setOpen} />}
          {type == 'newAppointment' && (
            <AppointmentForm
              type={'create'}
              userId={userId}
              setOpen={setOpen}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
