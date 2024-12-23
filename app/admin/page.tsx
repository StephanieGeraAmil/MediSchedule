'use client';
import Image from 'next/image';
import Link from 'next/link';

// import useSWR from 'swr';
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
import { useEffect, useState } from 'react';

const AdminPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointmentChanged, setAppointmentChanged] = useState(true);
  const [clientChanged, setClientChanged] = useState(true);
  const [doctorChanged, setDoctorChanged] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      const appointmentsData = await getRecentAppointmentList(); // Fetch the latest appointments
      setAppointments(appointmentsData); // Update state
      console.log(appointmentsData);
      setAppointmentChanged(false);
    };
    const fetchClients = async () => {
      const clientsData = await getAllPatients(); // Fetch the latest appointments
      setClients(clientsData); // Update state
      setClientChanged(false);
    };
    const fetchDoctors = async () => {
      const doctorsData = await getAllDoctors(); // Fetch the latest appointments
      setDoctors(doctorsData); // Update state
      setDoctorChanged(false);
    };
    if (appointmentChanged) fetchAppointments();
    if (clientChanged) fetchClients();
    if (doctorChanged) fetchDoctors();
  }, []);

  // const appointments = await getRecentAppointmentList();
  // const clients = await getAllPatients();
  // const doctors = await getAllDoctors();
  // const data = { appointments, clients, doctors };
  // Use SWR for fetching data
  // const { data: appointmentsData, mutate: mutateAppointments } = useSWR(
  //   'appointments',
  //   fetchAppointments
  // );
  // const { data: clientsData, mutate: mutateClients } = useSWR(
  //   'clients',
  //   fetchClients
  // );
  // const { data: doctorsData, mutate: mutateDoctors } = useSWR(
  //   'doctors',
  //   fetchDoctors
  // );

  // Data object to pass to DynamicTable
  // const data = {
  //   appointments: appointmentsData,
  //   clients: clientsData,
  //   doctors: doctorsData,
  // };
  // const refreshAppointments = () => mutateAppointments();
  // const refreshClients = () => mutateClients();
  // const refreshDoctors = () => mutateDoctors();


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
            {/* <CreationsModal type="newUser" onCreate={refreshClients} />
            <CreationsModal type="newDoctor" onCreate={refreshDoctors} />
            <CreationsModal
              type="newAppointment"
              onCreate={refreshAppointments}
            /> */}
            <CreationsModal
              type="newUser"
              onCreate={() => setAppointmentChanged(true)}
            />
            <CreationsModal
              type="newDoctor"
              onCreate={() => setClientChanged(true)}
            />
            <CreationsModal
              type="newAppointment"
              onCreate={() => setDoctorChanged(true)}
            />
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
          <DynamicTable
            data={{
              appointments,
              clients,
              doctors,
            }}
          />
        </section>
        {/* <DataTable columns={columns} data={appointments.documents} /> */}
      </main>
    </div>
  );
};

export default AdminPage;
