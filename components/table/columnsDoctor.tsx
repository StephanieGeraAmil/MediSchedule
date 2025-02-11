'use client';

import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';

import { Doctors } from '@/constants';
import { formatDateTime } from '@/lib/utils';
import { Appointment } from '@/types/appwrite.types';

import { AppointmentModal } from '../AppointmentModal';
import { StatusBadge } from '../StatusBadge';

export const columnsDoctor: ColumnDef<Appointment>[] = [
  {
    header: '#',
    cell: ({ row }) => {
      return <p className="text-14-medium ">{row.index + 1}</p>;
    },
    enableSorting: true,
    enableGlobalFilter: true,
  },
  {
    accessorFn: row => row.client.name,
    header: 'Patient',
    cell: ({ row }) => {
      const appointment = row.original;
      return <p className="text-14-medium ">{appointment.client.name}</p>;
    },
    enableSorting: true,
    enableGlobalFilter: true,
  },
  {
    accessorFn: row => row.status,
    header: 'Status',
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="min-w-[115px]">
          <StatusBadge status={appointment.status} />
        </div>
      );
    },
    enableSorting: true,
    enableGlobalFilter: true,
  },
  {
    accessorFn: row => formatDateTime(row.schedule).dateTime,
    header: 'Appointment',
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <p className="text-14-regular min-w-[100px]">
          {formatDateTime(appointment.schedule).dateTime}
        </p>
      );
    },
    enableSorting: true,
    enableGlobalFilter: true,
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
        </div>
      );
    },
  },
];
