'use client';
import Image from 'next/image';
import Link from 'next/link';

import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/table/DataTable';
import { getDoctorAppointmentList } from '@/lib/actions/appointment.actions';
import { columnsDoctor } from '@/components/table/columnsDoctor';
import { useEffect, useState } from 'react';
import { UpdateModal } from '@/components/UpdateModal';
import Header from '@/components/Header';
import { useGlobalDispatch, useGlobalState } from '@/contexts/GlobalState';

const DoctorPage = ({ params: { userId } }: SearchParamProps) => {
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
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
        const appointmentsData = await getDoctorAppointmentList(userId);
        dispatch({
          type: 'SET_APPOINTMENTS',
          payload: appointmentsData,
        });
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };
    const fetchingData = async () => {
      const fetchPromises = [];
      fetchPromises.push(fetchAppointments());

      await Promise.all(fetchPromises);
      setIsFetchingData(false);
    };
    fetchingData();
  }, []);
  if (isFetchingData)
    return (
      <div className="flex justify-center items-center h-screen w-full p-5">
        <Image
          src="/assets/icons/loader.svg"
          alt="loader"
          width={24}
          height={24}
          className="animate-spin"
        />
      </div>
    );
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
        <div className="w-[40%] mr-auto">
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-full rounded-md p-2"
          />
        </div>
        <DataTable
          columns={columnsDoctor}
          data={appointments}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </main>
    </div>
  );
};

export default DoctorPage;
