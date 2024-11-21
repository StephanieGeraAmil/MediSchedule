import Image from 'next/image';
import Link from 'next/link';

import { StatCard } from '@/components/StatCard';
import { columns } from '@/components/table/columns';
import { DataTable } from '@/components/table/DataTable';
import { getPatientAppointmentList } from '@/lib/actions/appointment.actions';

const PatientPage = async () => {
  const appointments = await getPatientAppointmentList();

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
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header">Welcome 👋</h1>
        </section>

        <section className="admin-stat">
          <StatCard
            type="completed"
            count={appointments.completedCount}
            label="Completed appointments"
            icon={'/assets/icons/check.svg'}
          />
          <StatCard
            type="appointments"
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

export default PatientPage;
