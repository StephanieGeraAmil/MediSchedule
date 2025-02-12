'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/table/DataTable';
import { columns as columnsAdmin } from '@/components/table/columns';
import { columns as columnsPatient } from '@/components/table/columnsForClientList';
import { columns as columnsDoctor } from '@/components/table/columnsForProfessionalList';
import { useGlobalState } from '@/contexts/GlobalState';

export const DynamicTable = ({}: {}) => {
  const { appointments, doctors, clients } = useGlobalState();
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [selectedTable, setSelectedTable] = useState<
    'appointments' | 'clients' | 'doctors'
  >('appointments');
  const [globalFilter, setGlobalFilter] = useState('');
  const handleTableChange = (type: 'appointments' | 'clients' | 'doctors') => {
    setSelectedTable(type);
    switch (type) {
      case 'appointments':
        setTableData(appointments);
        setTableColumns(columnsAdmin);
        break;
      case 'clients':
        setTableData(clients);
        setTableColumns(columnsPatient);
        break;
      case 'doctors':
        setTableData(doctors);
        setTableColumns(columnsDoctor);
        break;
      default:
        console.warn(`Unknown table type: ${type}`);
    }
  };

  useEffect(() => {
    handleTableChange('appointments');
  }, [appointments]);

  useEffect(() => {
    if (selectedTable === 'doctors') handleTableChange('doctors');
  }, [doctors]);

  return (
    <div className="w-full">
      <div className="flex flex-row items-center justify-between py-4">
        <div className="links flex flex-row space-x-8">
          <button
            onClick={() => handleTableChange('appointments')}
            className={`px-4 py-2 rounded ${
              selectedTable === 'appointments' ? 'text-white' : 'text-gray-500'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => handleTableChange('clients')}
            className={`px-4 py-2 rounded ${
              selectedTable === 'clients' ? 'text-white' : 'text-gray-500'
            }`}
          >
            Patients
          </button>
          <button
            onClick={() => handleTableChange('doctors')}
            className={`px-4 py-2 rounded ${
              selectedTable === 'doctors' ? 'text-white' : 'text-gray-500'
            }`}
          >
            Doctors
          </button>
        </div>
        <div className="w-[30%] ml-auto">
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-full rounded-md p-2"
          />
        </div>
      </div>
      <DataTable
        columns={tableColumns}
        data={tableData}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
    </div>
  );
};
