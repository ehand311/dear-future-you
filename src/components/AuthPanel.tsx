import { useState } from 'react';

type AuthPanelProps = {
  errorMessage: string;
  isLoading: boolean;
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
};

export function AuthPanel({ errorMessage, isLoading, onSignIn, onSignUp }: AuthPanelProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-5 py-8 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div>
          <p className="text-sm font-medium text-slate-500">Private family vault</p>
          <h1 className="mt-2 text-3xl font-semibold">DearFutureYou</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Sign in to save child profiles, memories, and letters across devices.</p>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/70">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {errorMessage && <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</p>}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button className="h-12 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white disabled:bg-slate-300" disabled={isLoading || !email || !password} onClick={() => onSignIn(email, password)}>
              Sign in
            </button>
            <button className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 disabled:text-slate-300" disabled={isLoading || !email || !password} onClick={() => onSignUp(email, password)}>
              Sign up
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
