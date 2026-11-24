import { cn } from '../../utils/cn';

export const PhantomIcon = ({ className, ...props }) => (
  <span className={cn('brand-stitch', className)} aria-hidden="true" {...props}>
    <span />
    <span />
    <span />
  </span>
);

export default PhantomIcon;
