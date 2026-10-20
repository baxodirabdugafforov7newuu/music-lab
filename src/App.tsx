import { useState } from 'react'
import type { FormEvent } from 'react'

export default function App() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')
  const isSignup = mode === 'signup'

  function switchMode() {
    setMode(isSignup ? 'login' : 'signup')
    setMessage('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Authentication is coming soon. No account has been created or signed in.')
  }

  return (
    <div className="app">
      <header className="brand"><span className="brand-mark" aria-hidden="true">♫</span> music lab<span className="beta">EARLY ACCESS</span></header>
      <main>
        <section className="intro" aria-labelledby="intro-title">
          <p className="eyebrow">FIND YOUR FREQUENCY</p>
          <h1 id="intro-title">Good music.<br />Your space.</h1>
          <p className="intro-copy">A new home for the sounds you love.<br />Something good is on the way.</p>
          <div className="record" aria-hidden="true"><div className="record-label">ml<span>33⅓ RPM</span></div></div>
          <p className="intro-footer">MADE FOR LISTENING.</p>
        </section>
        <section className="auth" aria-labelledby="auth-title">
          <div className="auth-content">
            <p className="eyebrow">YOUR MUSIC STARTS HERE</p>
            <h2 id="auth-title">{isSignup ? 'Find your rhythm.' : 'Welcome back.'}</h2>
            <p className="subtitle">{isSignup ? 'Create your Music Lab account.' : 'Log in to your Music Lab account.'}</p>
            <form key={mode} onSubmit={handleSubmit}>
              {isSignup && <label>Name<input name="name" type="text" autoComplete="name" placeholder="Your name" required maxLength={100} /></label>}
              <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
              <label>Password<input name="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'} minLength={isSignup ? 8 : undefined} required /></label>
              <button className="submit" type="submit">{isSignup ? 'Create account' : 'Log in'}<span aria-hidden="true">↗</span></button>
              <p className="form-status" role="status">{message}</p>
            </form>
            <p className="switch-mode">{isSignup ? 'Already have an account?' : 'New to Music Lab?'} <button type="button" onClick={switchMode}>{isSignup ? 'Log in' : 'Sign up'}</button></p>
            <p className="preview-note">Preview only · Account access is coming soon.</p>
          </div>
        </section>
      </main>
      <footer>© {new Date().getFullYear()} Music Lab</footer>
    </div>
  )
}
