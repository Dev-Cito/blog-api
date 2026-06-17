'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Globe, AtSign, Gamepad2, User } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  error?: string | null;
}

interface RegisterFormProps {
  onSubmit: (name: string, email: string, password: string) => Promise<void>;
  error?: string | null;
}

interface VideoBackgroundProps {
  videoUrl: string;
}

interface FormInputProps {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

interface SocialButtonProps {
  icon: React.ReactNode;
  name: string;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  id: string;
}

const FormInput: React.FC<FormInputProps> = ({ icon, type, placeholder, value, onChange, required }) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
    />
  </div>
);

const SocialButton: React.FC<SocialButtonProps> = ({ icon }) => (
  <button
    type="button"
    className="flex items-center justify-center p-2 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
  >
    {icon}
  </button>
);

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, id }) => (
  <div className="relative inline-block w-10 h-5 cursor-pointer">
    <input type="checkbox" id={id} className="sr-only" checked={checked} onChange={onChange} />
    <div className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-purple-600' : 'bg-white/20'}`}>
      <div className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : ''}`} />
    </div>
  </div>
);

const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div className="absolute inset-0 bg-black/50 z-10" />
      <video
        ref={videoRef}
        className="absolute inset-0 min-w-full min-h-full object-cover w-auto h-auto"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
};

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 rounded-2xl backdrop-blur-sm bg-black/50 border border-white/10">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2 relative group">
          <span className="absolute -inset-1 bg-linear-to-r from-purple-600/30 via-pink-500/30 to-blue-500/30 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
          <span className="relative inline-block text-3xl font-bold text-white">Blog</span>
        </h2>
        <div className="text-white/80 flex flex-col items-center space-y-1">
          <span className="relative inline-block animate-pulse">Your stories, your world</span>
          <span className="text-xs text-white/50 animate-pulse">[Sign in to continue writing]</span>
          <div className="flex space-x-2 text-xs text-white/40">
            <span className="animate-pulse">✍️</span>
            <span className="animate-bounce">📖</span>
            <span className="animate-pulse">🚀</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          icon={<Mail className="text-white/60" size={18} />}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative">
          <FormInput
            icon={<Lock className="text-white/60" size={18} />}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div onClick={() => setRemember(!remember)} className="cursor-pointer">
              <ToggleSwitch checked={remember} onChange={() => setRemember(!remember)} id="remember-me" />
            </div>
            <label
              htmlFor="remember-me"
              className="text-sm text-white/80 cursor-pointer hover:text-white transition-colors"
              onClick={() => setRemember(!remember)}
            >
              Remember me
            </label>
          </div>
          <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-8">
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 absolute w-full" />
          <div className="bg-transparent px-4 relative text-white/60 text-sm">quick access via</div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <SocialButton icon={<Globe size={18} />} name="Google" />
          <SocialButton icon={<AtSign size={18} />} name="X" />
          <SocialButton icon={<Gamepad2 size={18} />} name="Steam" />
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-white/60">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-white hover:text-purple-300 transition-colors">
          Create Account
        </Link>
      </p>
    </div>
  );
};

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, error }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (name.trim().length < 2) {
      setValidationError('Name must be at least 2 characters');
      return;
    }
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim(), email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = validationError || error;

  return (
    <div className="p-8 rounded-2xl backdrop-blur-sm bg-black/50 border border-white/10">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2 relative group">
          <span className="absolute -inset-1 bg-linear-to-r from-purple-600/30 via-pink-500/30 to-blue-500/30 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
          <span className="relative inline-block text-3xl font-bold text-white">Blog</span>
        </h2>
        <div className="text-white/80 flex flex-col items-center space-y-1">
          <span className="relative inline-block animate-pulse">Join the community</span>
          <span className="text-xs text-white/50 animate-pulse">[Start your writing journey]</span>
          <div className="flex space-x-2 text-xs text-white/40">
            <span className="animate-pulse">✨</span>
            <span className="animate-bounce">📝</span>
            <span className="animate-pulse">🌍</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          icon={<User className="text-white/60" size={18} />}
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <FormInput
          icon={<Mail className="text-white/60" size={18} />}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative">
          <FormInput
            icon={<Lock className="text-white/60" size={18} />}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <FormInput
            icon={<Lock className="text-white/60" size={18} />}
            type={showConfirm ? 'text' : 'password'}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none transition-colors"
            onClick={() => setShowConfirm(!showConfirm)}
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {displayError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm text-center">{displayError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-8">
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 absolute w-full" />
          <div className="bg-transparent px-4 relative text-white/60 text-sm">or sign up via</div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <SocialButton icon={<Globe size={18} />} name="Google" />
          <SocialButton icon={<AtSign size={18} />} name="X" />
          <SocialButton icon={<Gamepad2 size={18} />} name="Steam" />
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-white/60">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-white hover:text-purple-300 transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
};

const LoginPage = { LoginForm, RegisterForm, VideoBackground };
export default LoginPage;
