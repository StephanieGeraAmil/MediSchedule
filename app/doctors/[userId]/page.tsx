import Image from 'next/image';
import Link from 'next/link';

import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/table/DataTable';
import { getDoctorAppointmentList } from '@/lib/actions/appointment.actions';
import { CreationsModal } from '@/components/CreationsModal';
import { columnsDoctor } from '@/components/table/columnsDoctor';
import { useEffect } from 'react';
import { UpdateModal } from '@/components/UpdateModal';
import Header from '@/components/Header';

const DoctorPage = async ({ params: { userId } }: SearchParamProps) => {
  const appointments = await getDoctorAppointmentList(userId);

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <Header />

      <main className="admin-main">
        <section className="w-full flex flex-col md:flex-row space-y-4 md:space-y-0 justify-between">
          <div className="w-full md:w-1/2 flex flex-col gap-2">
            <h1 className="header">Welcome 👋</h1>
          </div>
          <div className="overview-modal-buttons">
            <div className="w-full md:w-1/2 flex justify-end gap-2">
              <UpdateModal type="changePass" userId={userId} />
            </div>
            <div className="w-full md:w-1/2 flex justify-end gap-2">
              <UpdateModal type="changeDoctor" userId={userId} />
            </div>
          </div>
        </section>

        <section className="admin-stat">
          <StatCard
            type="completed"
            count={appointments?.completedCount || 0}
            label="Completed appointments"
            icon={'/assets/icons/check.svg'}
          />
          <StatCard
            type="scheduled"
            count={appointments?.scheduledCount || 0}
            label="Scheduled appointments"
            icon={'/assets/icons/appointments.svg'}
          />
          <StatCard
            type="no-show"
            count={appointments?.noShowCount || 0}
            label="No-Show appointments"
            icon={'/assets/icons/cancelled.svg'}
          />
        </section>

        <DataTable
          columns={columnsDoctor}
          data={appointments?.documents || []}
        />
      </main>
    </div>
  );
};

export default DoctorPage;
