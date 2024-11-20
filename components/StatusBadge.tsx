import clsx from 'clsx';
import Image from 'next/image';

import { StatusIcon } from '@/constants';

export const StatusBadge = ({ status }: { status: Status }) => {
  return (
    <div
      className={clsx('status-badge', {
        'bg-green-600': status === 'completed',
        'bg-blue-600': status === 'scheduled',
        'bg-red-600': status === 'no-show',
        'bg-yellow-600': status === 'cancelled',
      })}
    >
      <Image
        src={StatusIcon[status]}
        alt="status"
        width={24}
        height={24}
        className="h-fit w-3"
      />
      <p
        className={clsx('text-12-semibold capitalize', {
          'text-green-500': status === 'completed',
          'text-blue-500': status === 'scheduled',
          'text-red-500': status === 'no-show',
          'text-yellow-500': status === 'cancelled',
        })}
      >
        {status}
      </p>
    </div>
  );
};
