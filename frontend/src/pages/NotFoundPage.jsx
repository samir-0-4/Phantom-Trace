import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export const NotFoundPage = () => (
  <section className="mx-auto w-full max-w-lg py-12 sm:py-16">
    <p className="section-label">Error 404</p>
    <h1 className="page-heading mt-2">Page not found</h1>
    <p className="page-lede mt-3">Check the address or return to an investigation from the dashboard.</p>
    <div className="mt-5 flex flex-wrap gap-3">
      <Button as={Link} to="/dashboard">Open Dashboard</Button>
      <Button as={Link} to="/" variant="secondary">Return to Home</Button>
    </div>
  </section>
);

export default NotFoundPage;
