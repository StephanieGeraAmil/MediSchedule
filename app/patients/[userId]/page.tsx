'use client';
import Image from 'next/image';
import Link from 'next/link';

import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/table/DataTable';
import { getPatientAppointmentList } from '@/lib/actions/appointment.actions';
import { CreationsModal } from '@/components/CreationsModal';
import { UpdateModal } from '@/components/UpdateModal';
import { columnsPatient } from '@/components/table/columnsPatient';
import Header from '@/components/Header';
import { useGlobalDispatch, useGlobalState } from '@/contexts/GlobalState';
import { useEffect } from 'react';

const PatientPage = ({ params: { userId } }: SearchParamProps) => {
  const { appointments } = useGlobalState();
  const dispatch = useGlobalDispatch();
  const completedCount = appointments.filter(
    appointment => appointment.status === 'completed'
  ).length;
  const scheduledCount = appointments.filter(
    appointment => appointment.status === 'scheduled'
  ).length;
  const noShowCount = appointments.filter(
    appointment => appointment.status === 'no-show'
  ).length;
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointmentsData = await getPatientAppointmentList(userId);
        dispatch({
          type: 'SET_APPOINTMENTS',
          payload: appointmentsData,
        });
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };

    fetchAppointments();
  }, []);
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
              <CreationsModal type="newAppointment" />
            </div>
            <div className="w-full md:w-1/2 flex justify-end gap-2">
              <UpdateModal type="changePass" userId={userId} />
            </div>
            <div className="w-full md:w-1/2 flex justify-end gap-2">
              <UpdateModal type="changePatient" userId={userId} />
            </div>
          </div>
        </section>

        <section className="admin-stat">
          <StatCard
            type="completed"
            count={completedCount}
            label="Completed appointments"
            icon={'/assets/icons/check.svg'}
          />
          <StatCard
            type="scheduled"
            count={scheduledCount}
            label="Scheduled appointments"
            icon={'/assets/icons/appointments.svg'}
          />
          <StatCard
            type="no-show"
            count={noShowCount}
            label="No-Show appointments"
            icon={'/assets/icons/cancelled.svg'}
          />
        </section>

        <DataTable columns={columnsPatient} data={appointments} />
      </main>
    </div>
  );
};

export default PatientPage;
