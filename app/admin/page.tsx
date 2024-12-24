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
  // const [appointments, setAppointments] = useState([]);
  // const [clients, setClients] = useState([]);
  // const [doctors, setDoctors] = useState([]);
  const { appointments } = useGlobalState();
  const dispatch = useGlobalDispatch();
  // const [appointmentChanged, setAppointmentChanged] = useState(true);
  // const [clientChanged, setClientChanged] = useState(true);
  // const [doctorChanged, setDoctorChanged] = useState(true);
  const completedCount = appointments.filter(
    appointment => appointment.status === 'completed'
  ).length;
  const scheduledCount = appointments.filter(
    appointment => appointment.status === 'scheduled'
  ).length;
  const noShowCount = appointments.filter(
    appointment => appointment.status === 'no-show'
  ).length;

  // useEffect(() => {
  //   const fetchAppointments = async () => {
  //     const appointmentsData = await getRecentAppointmentList(); // Fetch the latest appointments
  //     setAppointments(appointmentsData); // Update state
  //     console.log(appointmentsData);
  //     // setAppointmentChanged(false);
  //     console.log('making appointments false');
  //   };
  //   const fetchClients = async () => {
  //     const clientsData = await getAllPatients(); // Fetch the latest appointments
  //     setClients(clientsData); // Update state
  //     // setClientChanged(false);
  //     console.log('making cliemt false');
  //   };
  //   const fetchDoctors = async () => {
  //     const doctorsData = await getAllDoctors(); // Fetch the latest appointments
  //     setDoctors(doctorsData); // Update state
  //     // setDoctorChanged(false);
  //     console.log('making doctor false');
  //   };
  //   // if (appointmentChanged) fetchAppointments();
  //   // if (clientChanged) fetchClients();
  //   // if (doctorChanged) fetchDoctors();
  //   // }, [appointmentChanged, clientChanged, doctorChanged]);
  // }, []);
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointmentsData = await getRecentAppointmentList();
        console.log('appointmentsData', appointmentsData);
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
    fetchAppointments();
    fetchClients();
    fetchDoctors();
  }, []);

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
            <CreationsModal
              type="newUser"
              // onCreate={() => setClientChanged(true)}
            />
            <CreationsModal
              type="newDoctor"
              // onCreate={() => setDoctorChanged(true)}
            />
            <CreationsModal
              type="newAppointment"
              // onCreate={() => setAppointmentChanged(true)}
            />
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
          <DynamicTable
          // data={{
          //   appointments: appointments.documents,
          //   clients,
          //   doctors,
          // }}
          // onUpdate={() => setAppointmentChanged(true)}
          />
        </section>
        {/* <DataTable columns={columns} data={appointments.documents} /> */}
      </main>
    </div>
  );
};

export default AdminPage;
