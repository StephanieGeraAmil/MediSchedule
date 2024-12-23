import Image from 'next/image';
import Link from 'next/link';

import { StatCard } from '@/components/StatCard';
// import { columns } from '@/components/table/columns';
// import { DataTable } from '@/components/table/DataTable';
import { getRecentAppointmentList } from '@/lib/actions/appointment.actions';
// import { Button } from '@/components/ui/button';
import { CreationsModal } from '@/components/CreationsModal';
import Header from '@/components/Header';
import { DynamicTable } from '@/components/table/dynamicTable';
import { DataTable } from '@/components/table/DataTable';
import { columns } from '@/components/table/columns';
import { getAllPatients } from '@/lib/actions/patient.actions';
import { getAllDoctors } from '@/lib/actions/doctor.actions';

const AdminPage = async () => {
  const appointments = await getRecentAppointmentList();
  const clients = await getAllPatients();
  const doctors = await getAllDoctors();
  const data = { appointments, clients, doctors };
  // console.log(data);

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <Header isAdmin={true} />
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
        <section className="w-full flex flex-col md:flex-row space-y-4 md:space-y-0 justify-between">
          <DynamicTable data={data} />
        </section>
        {/* <DataTable columns={columns} data={appointments.documents} /> */}
      </main>
    </div>
  );
};

export default AdminPage;
