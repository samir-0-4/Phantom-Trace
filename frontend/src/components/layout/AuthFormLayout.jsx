import Card from '../common/Card';

export const AuthFormLayout = ({ title, description, error, footer, children }) => (
  <div className="mx-auto w-full min-w-0 max-w-md py-10 sm:py-14">
    <div className="mb-5 space-y-2">
      <h1 className="page-heading">{title}</h1>
      <p className="page-lede">{description}</p>
    </div>

    <Card footer={footer}>
      {error && (
        <div role="alert" className="mb-4 rounded-md border border-risk-critical/45 bg-risk-critical/10 p-3 text-sm text-risk-critical">
          {error}
        </div>
      )}
      {children}
    </Card>
  </div>
);

export default AuthFormLayout;
