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
      const client = row.original;
      return <p className="text-14-medium ">{client.name}</p>;
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const client = row.original;
     
      return <p className="text-14-medium ">{client.email}</p>;
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => {
      const client = row.original;
    
      return <p className="text-14-medium ">{client.phone}</p>;
    },
  },

  
];
