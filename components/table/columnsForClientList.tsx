'use client';

import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';

import { Doctors } from '@/constants';
import { formatDateTime } from '@/lib/utils';
import { Patient } from '@/types/appwrite.types';

import { AppointmentModal } from '../AppointmentModal';
import { StatusBadge } from '../StatusBadge';

export const columns: ColumnDef<Patient>[] = [
  {
    header: '#',
    cell: ({ row }) => {
      return <p className="text-14-medium ">{row.index + 1}</p>;
    },
    enableSorting: true,
    enableGlobalFilter: true,
  },
  {
    // id: 'patient',
    accessorFn: row => row.name,
    header: 'Patient',
    cell: ({ row }) => {
      const client = row.original;
      return <p className="text-14-medium ">{client.name}</p>;
    },
    enableSorting: true,
    enableGlobalFilter: true,
  },
  {
    // id: 'email',
    accessorFn: row => row.email,
    header: 'Email',
    cell: ({ row }) => {
      const client = row.original;

      return <p className="text-14-medium ">{client.email}</p>;
    },
    enableSorting: true,
    enableGlobalFilter: true,
  },
  {
    // id: 'phone',
    accessorFn: row => row.phone,
    header: 'Phone',
    cell: ({ row }) => {
      const client = row.original;

      return <p className="text-14-medium ">{client.phone}</p>;
    },
    enableSorting: true,
    enableGlobalFilter: true,
  },
];
