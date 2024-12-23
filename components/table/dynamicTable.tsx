'use client';

import { useState } from 'react';
import { DataTable } from '@/components/table/DataTable';
import { columns as columnsAdmin } from '@/components/table/columns';
import { columns as columnsPatient } from '@/components/table/columnsForClientList';
import { columns as columnsDoctor } from '@/components/table/columnsForProfessionalList';
interface TableData {
  appointments: any[];
  clients: any[];
  doctors: any[];
}

export const DynamicTable = ({ data }: { data: TableData }) => {
  // Ensure initial states are correctly set
  const [tableData, setTableData] = useState(data.appointments.documents || []);
  const [tableColumns, setTableColumns] = useState(columnsAdmin);
  const [selectedTable, setSelectedTable] = useState<
    'appointments' | 'clients' | 'doctors'
  >('appointments');

  console.log(data);
  const handleTableChange = (type: 'appointments' | 'clients' | 'doctors') => {
    setSelectedTable(type);
    switch (type) {
      case 'appointments':
        console.log('dynamic table appointments');
        setTableData(data.appointments.documents || []); // Fallback to empty array if undefined
        setTableColumns(columnsAdmin);
        break;
      case 'clients':
        setTableData(data.clients || []); // Fallback to empty array if undefined
        setTableColumns(columnsPatient);
        break;
      case 'doctors':
        setTableData(data.doctors || []); // Fallback to empty array if undefined
        setTableColumns(columnsDoctor);
        break;
      default:
        console.warn(`Unknown table type: ${type}`);
    }
  };

  return (
    <div className="w-full">
      <div className="links flex flex-row space-x-8 justify-start py-4">
        <button
          onClick={() => handleTableChange('appointments')}
          className={`px-4 py-2 rounded ${
            selectedTable === 'appointments'
              ? // ? 'bg-blue-500 text-white'
                'text-white'
              : // : 'bg-gray-200 text-black'
                'text-gray-500'
          }`}
        >
          Appointments
        </button>
        <button
          onClick={() => handleTableChange('clients')}
          className={`px-4 py-2 rounded ${
            selectedTable === 'clients'
              ? // ? 'bg-blue-500 text-white'
                'text-white'
              : 'text-gray-500'
            //#262C30
          }`}
        >
          Patients
        </button>
        <button
          onClick={() => handleTableChange('doctors')}
          className={`px-4 py-2 rounded ${
            selectedTable === 'doctors'
              ? // ? 'bg-blue-500 text-white'
                'text-white'
              : 'text-gray-500'
          }`}
        >
          Doctors
        </button>
      </div>
      <DataTable columns={tableColumns} data={tableData} />
    </div>
  );
};
