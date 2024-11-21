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
}: {
  type: 'newUser' | 'newDoctor' | 'newAppointment';
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`capitalize bg-green-500`}>{type}</Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog sm:max-w-md">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle className="capitalize">{type} Appointment</DialogTitle>
          {!['complete', 'no-show'].includes(type) && (
            <DialogDescription>
              Please fill in the following details to {type} the appointment
            </DialogDescription>
          )}
        </DialogHeader>
        {type == 'newUser' && <PatientForm />}
        {/* {type == 'newDoctor' && <DoctorForm />}
        {type == 'newAppointment' && <AppointmentForm type={'create'} />} */}
      </DialogContent>
    </Dialog>
  );
};
