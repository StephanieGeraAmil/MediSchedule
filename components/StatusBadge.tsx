import clsx from 'clsx';
import Image from 'next/image';

import { StatusIcon } from '@/constants';

export const StatusBadge = ({ status }: { status: Status }) => {
  return (
    <div
      className={clsx('status-badge', {
        'bg-green-600': status === 'completed',
        'bg-blue-600': status === 'cancelled',
        'bg-red-600': status === 'no-show',
        'bg-yellow-700': status === 'scheduled',
      })}
    >
      <Image
        src={StatusIcon[status]}
        alt="status"
        width={24}
        height={24}
        className={clsx('h-fit w-3', {
          'fill-green-500': status === 'completed',
          'fill-blue-500': status === 'cancelled',
          'fill-red-500': status === 'no-show',
          'fill-yellow-300': status === 'scheduled',
        })}
      />
      <p
        className={clsx('text-12-semibold capitalize', {
          'text-green-500': status === 'completed',
          'text-blue-500': status === 'cancelled',
          'text-red-500': status === 'no-show',
          'text-yellow-300': status === 'scheduled',
        })}
      >
        {status}
      </p>
    </div>
  );
};
