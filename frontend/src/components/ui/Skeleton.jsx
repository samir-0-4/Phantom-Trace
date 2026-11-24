import { cn } from '../../utils/cn';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={cn(
        'rounded-md bg-cyber-elevated',
        className
      )}
      {...props}
    />
  );
};

export const CardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="workstation-panel space-y-4 p-4 sm:p-5"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-48" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-2.5 w-4/5" />
          </div>
        </div>
      ))}
    </>
  );
};

export const TableRowSkeleton = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="border-b border-cyber-border">
          <td className="py-4 px-6">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24 mt-1.5" />
          </td>
          <td className="py-4 px-6">
            <Skeleton className="h-4 w-28" />
          </td>
          <td className="py-4 px-6">
            <Skeleton className="h-5 w-20 rounded-full" />
          </td>
          <td className="py-4 px-6">
            <Skeleton className="h-4 w-12" />
          </td>
          <td className="py-4 px-6 text-right">
            <Skeleton className="h-4 w-6 ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
};

export default Skeleton;
