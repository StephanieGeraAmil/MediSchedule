'use client';

import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';

import { Doctors } from '@/constants';
import { formatDateTime } from '@/lib/utils';
import { Appointment } from '@/types/appwrite.types';

import { AppointmentModal } from '../AppointmentModal';
import { StatusBadge } from '../StatusBadge';

export const columns: ColumnDef<Appointment>[] = [
  {
    header: '#',
    cell: ({ row }) => {
      return <p className="text-14-medium ">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: 'patient',
    header: 'Patient',
    cell: ({ row }) => {
      const appointment = row.original;
      // return <p className="text-14-medium ">{appointment.patient.name}</p>;
      return <p className="text-14-medium ">{appointment.client.name}</p>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="min-w-[115px]">
          <StatusBadge status={appointment.status} />
        </div>
      );
    },
  },
  {
    accessorKey: 'schedule',
    header: 'Appointment',
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <p className="text-14-regular min-w-[100px]">
          {formatDateTime(appointment.schedule).dateTime}
        </p>
      );
    },
  },

  {
    accessorKey: 'professional',
    header: 'Doctor',
    cell: ({ row }) => {
      const appointment = row.original;

      return (
        <div className="flex items-center gap-3">
          <Image
            src={appointment.professional?.photoFileUrl || ''}
            alt="professional"
            width={100}
            height={100}
            className="size-8"
          />
          <p className="whitespace-nowrap">
            Dr. {appointment.professional?.name || ''}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: 'proffesional_speciality',
    header: 'Speciality',
    cell: ({ row }) => {
      const appointment = row.original;

      return (
        <p className="whitespace-nowrap">
          {appointment.professional?.speciality || ''}
        </p>
      );
    },
  },
  {
    id: 'actions',
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      const appointment = row.original;

      return (
        <div className="flex gap-1">
          <AppointmentModal
            patientId={appointment.client.$id}
            appointment={appointment}
            type="complete"
          />
          <AppointmentModal
            patientId={appointment.client.$id}
            appointment={appointment}
            type="no-show"
          />
          <AppointmentModal
            patientId={appointment.client.$id}
            appointment={appointment}
            type="re-schedule"
          />
          <AppointmentModal
            patientId={appointment.client.$id}
            appointment={appointment}
            type="cancel"
          />
        </div>
      );
    },
  },
];
