'use client';

import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';

import { Doctors } from '@/constants';
import { formatDateTime } from '@/lib/utils';
import { Doctor as DoctorsType } from '@/types/appwrite.types';

import { AppointmentModal } from '../AppointmentModal';
import { StatusBadge } from '../StatusBadge';

export const columns: ColumnDef<DoctorsType>[] = [
  {
    header: '#',
    cell: ({ row }) => {
      return <p className="text-14-medium ">{row.index + 1}</p>;
    },
    enableSorting: true,
    enableGlobalFilter: true,
  },
  {
    // accessorKey: 'doctor',
    // id: 'doctor',
    accessorFn: row => row.name,
    header: 'Doctor',
    cell: ({ row }) => {
      return <p className="text-14-medium ">{row.original.name}</p>;
    },
    enableSorting: true,
    enableGlobalFilter: true,
  },
  {
    // accessorKey: 'email',
    // id: 'email',
    accessorFn: row => row.email,
    header: 'Email',
    cell: ({ row }) => {
      return <p className="text-14-medium ">{row.original.email}</p>;
    },
    enableSorting: true,
    enableGlobalFilter: true,
  },
  {
    // accessorKey: 'phone',
    // id: 'phone',
    accessorFn: row => row.phone,
    header: 'Phone',
    cell: ({ row }) => {
      return <p className="text-14-medium ">{row.original.phone}</p>;
    },
    enableSorting: true,
    enableGlobalFilter: true,
  },
  {
    // accessorKey: 'speciality',
    // id: 'speciality',
    accessorFn: row => row.speciality,
    header: 'Speciality',
    cell: ({ row }) => {
      return (
        <p className="whitespace-nowrap">{row.original.speciality || ''}</p>
      );
    },
    enableSorting: true,
    enableGlobalFilter: true,
  },
];
