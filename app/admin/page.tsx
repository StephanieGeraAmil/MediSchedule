'use client';
import Image from 'next/image';
import Link from 'next/link';

import { StatCard } from '@/components/StatCard';

import { getRecentAppointmentList } from '@/lib/actions/appointment.actions';

import { CreationsModal } from '@/components/CreationsModal';
import Header from '@/components/Header';
import { DynamicTable } from '@/components/table/dynamicTable';
import { DataTable } from '@/components/table/DataTable';
import { columns } from '@/components/table/columns';
import { getAllPatients } from '@/lib/actions/patient.actions';
import { getAllDoctors } from '@/lib/actions/doctor.actions';
import { useEffect, useState } from 'react';
import { useGlobalDispatch, useGlobalState } from '@/contexts/GlobalState';

const AdminPage = () => {
  const [isFetchingData, setIsFetchingData] = useState(true);
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
        const appointmentsData = await getRecentAppointmentList();
        dispatch({
          type: 'SET_APPOINTMENTS',
          payload: appointmentsData,
        });
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };

    const fetchClients = async () => {
      try {
        const clientsData = await getAllPatients();
        dispatch({ type: 'SET_CLIENTS', payload: clientsData });
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      }
    };

    const fetchDoctors = async () => {
      try {
        const doctorsData = await getAllDoctors();
        dispatch({ type: 'SET_DOCTORS', payload: doctorsData });
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    };
    const fetchingData = async () => {
      const fetchPromises = [];
      fetchPromises.push(fetchAppointments());
      fetchPromises.push(fetchClients());
      fetchPromises.push(fetchDoctors());
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
        <section className="w-full flex flex-col md:flex-row space-y-4 md:space-y-0 justify-between">
          <DynamicTable />
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
