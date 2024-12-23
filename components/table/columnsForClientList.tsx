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
      // return <p className="text-14-medium ">{appointment.patient.name}</p>;
      return <p className="text-14-medium ">{client.name}</p>;
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const client = row.original;
      // return (
      //   <div className="min-w-[115px]">
      //     <StatusBadge status={client.email} />
      //   </div>
      // );
      return <p className="text-14-medium ">{client.email}</p>;
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => {
      const client = row.original;
      // return (
      //   <div className="min-w-[115px]">
      //     <StatusBadge status={client.phone} />
      //   </div>
      // );
      return <p className="text-14-medium ">{client.phone}</p>;
    },
  },

  // {
  //   id: 'actions',
  //   header: () => <div className="pl-4">Actions</div>,
  //   cell: ({ row }) => {
  //     const client = row.original;

  //     return (
  //       <div className="flex gap-1">
  //         {/* <AppointmentModal
  //           // patientId={appointment.patient.$id}
  //           patientId={appointment.client.$id}
  //           // userId={appointment.userId}
  //           appointment={appointment}
  //           type="complete"
  //         />
  //         <AppointmentModal
  //           // patientId={appointment.patient.$id}
  //           patientId={appointment.client.$id}
  //           // userId={appointment.userId}
  //           appointment={appointment}
  //           type="no-show"
  //         />
  //         <AppointmentModal
  //           // patientId={appointment.patient.$id}
  //           patientId={appointment.client.$id}
  //           // userId={appointment.userId}
  //           appointment={appointment}
  //           type="re-schedule"
  //         />
  //         <AppointmentModal
  //           // patientId={appointment.patient.$id}
  //           patientId={appointment.client.$id}
  //           // userId={appointment.userId}
  //           appointment={appointment}
  //           type="cancel"
  //         /> */}
  //         See more..
  //       </div>
  //     );
  //   },
  // },
];
