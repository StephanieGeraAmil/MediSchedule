import Image from 'next/image';
import Link from 'next/link';

import { StatCard } from '@/components/StatCard';
import { columns } from '@/components/table/columns';
import { DataTable } from '@/components/table/DataTable';
import { getRecentAppointmentList } from '@/lib/actions/appointment.actions';
import { Button } from '@/components/ui/button';
import { CreationsModal } from '@/components/CreationsModal';

const AdminPage = async () => {
  const appointments = await getRecentAppointmentList();

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-fit"
          />
        </Link>

        <p className="text-16-semibold">Admin Dashboard</p>
      </header>

      <main className="admin-main">
        <section className="w-full flex flex-col md:flex-row space-y-4 md:space-y-0 justify-between">
          <div className="w-full md:w-1/2 flex flex-col gap-2">
            <h1 className="header">Welcome 👋</h1>
            <p className="text-dark-700">
              Start the day with managing appointments
            </p>
          </div>
          <div className="w-full md:w-1/2 flex justify-end gap-2">
            <CreationsModal type="newUser" />
            <CreationsModal type="newDoctor" />
            <CreationsModal type="newAppointment" />
          </div>
        </section>

        <section className="admin-stat">
          <StatCard
            type="completed"
            count={appointments.completedCount}
            label="Completed appointments"
            icon={'/assets/icons/check.svg'}
          />
          <StatCard
            type="scheduled"
            count={appointments.scheduledCount}
            label="Scheduled appointments"
            icon={'/assets/icons/appointments.svg'}
          />
          <StatCard
            type="no-show"
            count={appointments.noShowCount}
            label="No-Show appointments"
            icon={'/assets/icons/cancelled.svg'}
          />
        </section>

        <DataTable columns={columns} data={appointments.documents} />
      </main>
    </div>
  );
};

export default AdminPage;
