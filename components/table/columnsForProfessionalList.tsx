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
      const professional = row.original;
      return <p className="text-14-medium ">{professional.name}</p>;
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const professional = row.original;

      return <p className="text-14-medium ">{professional.email}</p>;
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => {
      const professional = row.original;

      return <p className="text-14-medium ">{professional.phone}</p>;
    },
  },
  {
    accessorKey: 'speciality',
    header: 'Speciality',
    cell: ({ row }) => {
      const professional = row.original;

      return (
        <p className="whitespace-nowrap">{professional.speciality || ''}</p>
      );
    },
  },
];
