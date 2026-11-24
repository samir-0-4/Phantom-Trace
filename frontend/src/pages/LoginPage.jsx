import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import AuthFormLayout from '../components/layout/AuthFormLayout';
import Button from '../components/common/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../services/api/apiClient';

const validate = ({ email, password }) => {
  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
};

export const LoginPage = () => {
  const [fields, setFields] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const set = (k) => (e) => {
    setFields((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await login({ email: fields.email, password: fields.password });
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Authentication failed. Check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="Sign In"
      description="Open your investigation workspace."
      error={serverError}
      footer={<p className="flex flex-wrap justify-between gap-2 text-sm text-text-secondary"><span>Need an account?</span> <Link to="/register" className="text-link">Create Account</Link></p>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          required
          icon={Mail}
          value={fields.email}
          onChange={set('email')}
          placeholder="name@example.com"
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          required
          icon={Lock}
          value={fields.password}
          onChange={set('password')}
          error={errors.password}
          autoComplete="current-password"
        />
        <div className="pt-2">
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign In
          </Button>
        </div>
      </form>
    </AuthFormLayout>
  );
};

export default LoginPage;
