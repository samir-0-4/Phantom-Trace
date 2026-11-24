import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Lock } from 'lucide-react';
import AuthFormLayout from '../components/layout/AuthFormLayout';
import Button from '../components/common/Button';
import Input from '../components/ui/Input';
import { authService } from '../services/auth/authService';
import { getApiErrorMessage } from '../services/api/apiClient';

const validate = ({ fullName, email, password }) => {
  const errors = {};
  if (!fullName || fullName.trim().length < 2) errors.fullName = 'Full name must be at least 2 characters';
  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  return errors;
};

export const RegisterPage = () => {
  const [fields, setFields] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      await authService.register({
        fullName: fields.fullName,
        email: fields.email,
        password: fields.password,
      });
      navigate('/login?registered=1', { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Registration failed. The email may already be in use.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="Create Account"
      description="Set up a workspace for your cases and evidence."
      error={serverError}
      footer={<p className="flex flex-wrap justify-between gap-2 text-sm text-text-secondary"><span>Already registered?</span> <Link to="/login" className="text-link">Sign In</Link></p>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Full name"
          type="text"
          required
          icon={User}
          value={fields.fullName}
          onChange={set('fullName')}
          placeholder="Analyst Name"
          error={errors.fullName}
          autoComplete="name"
        />
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
          hint="Minimum 8 characters"
          error={errors.password}
          autoComplete="new-password"
        />
        <div className="pt-2">
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create Account
          </Button>
        </div>
      </form>
    </AuthFormLayout>
  );
};

export default RegisterPage;
