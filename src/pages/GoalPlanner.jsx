<<<<<<< HEAD
// OWNER: Person 1 - replace this placeholder with the onboarding + goal planner.
// Keep the default export so routing in App.jsx keeps working.
export default function GoalPlanner() {
  return (
    <section>
      <h1 className="page-title">Your Financial Goals</h1>
      <p className="page-sub">Onboarding and goal calculator will live here.</p>
      <div className="card placeholder">Placeholder - Person 1 builds this module.</div>
    </section>
  )
=======
import { useState } from 'react';
import '../styles/GoalPlanner.css';
import {
  defaultProfile,
  formatINR,
  getAvailable,
  getSuggestedContribution,
  getRequiredMonthly,
  getMonthsToGoal,
  getFeasibility,
  getMilestones,
} from '../utils/goalCalculations';

const STATUS = {
  'on-track': {
    title: 'Your goal looks reachable',
    text: (p) => `Saving ${formatINR(p.monthlyContribution)} a month covers what you need by your deadline.`,
  },
  stretch: {
    title: 'Reachable, but tight',
    text: (p, req) =>
      `You would need ${formatINR(req)} a month. That is possible with your income, but leaves little room for surprises.`,
  },
  'off-track': {
    title: 'Too tight for this deadline',
    text: (p, req) =>
      `You would need ${formatINR(req)} a month, which is more than you have left after essentials. Try a later deadline or a smaller goal.`,
  },
};

function NumberField({ label, name, value, onChange, hint }) {
  return (
    <label className="gp-field">
      <span className="gp-label">{label}</span>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        name={name}
        value={value}
        onChange={onChange}
      />
      {hint && <span className="gp-hint">{hint}</span>}
    </label>
  );
}

/**
 * Props (all optional):
 *  - initialProfile: object with the shared financialProfile fields
 *  - onProfileChange(profile): called whenever the profile changes,
 *    so Person 3 can share it with the Dashboard / other pages.
 */
export default function GoalPlanner({ initialProfile, onProfileChange }) {
  const [profile, setProfile] = useState({ ...defaultProfile, ...initialProfile });

  const update = (next) => {
    setProfile(next);
    if (onProfileChange) onProfileChange(next);
  };

  const handleNumber = (e) => {
    const { name, value } = e.target;
    update({ ...profile, [name]: value === '' ? 0 : Math.max(0, Number(value)) });
  };

  const available = getAvailable(profile);
  const suggested = getSuggestedContribution(profile);
  const required = getRequiredMonthly(profile);
  const months = getMonthsToGoal(profile);
  const status = getFeasibility(profile);
  const milestones = getMilestones(profile);
  const firstOpen = milestones.findIndex((m) => !m.done);
  const gap = Math.max(0, profile.goalAmount - profile.existingSavings);
  const progress = profile.goalAmount > 0
    ? Math.min(100, Math.round((profile.existingSavings / profile.goalAmount) * 100))
    : 0;

  return (
    <section className="gp-root">
      <header className="gp-header">
        <h1>Plan a goal you can actually reach</h1>
        <p>Tell us about your month. We will work out what is realistic, not what sounds impressive.</p>
      </header>

      <div className="gp-grid">
        <form className="gp-card" onSubmit={(e) => e.preventDefault()}>
          <h2>Your month</h2>
          <NumberField label="Monthly income (₹)" name="monthlyIncome" value={profile.monthlyIncome} onChange={handleNumber} />
          <NumberField label="Essential expenses (₹)" name="monthlyExpenses" value={profile.monthlyExpenses} onChange={handleNumber} hint="Food, travel, fees, phone and other must-pay items." />
          <NumberField label="Savings so far (₹)" name="existingSavings" value={profile.existingSavings} onChange={handleNumber} />

          <h2>Your goal</h2>
          <NumberField label="Goal amount (₹)" name="goalAmount" value={profile.goalAmount} onChange={handleNumber} hint="A laptop, course fees, or a first investment fund." />
          <NumberField label="Months to reach it" name="goalMonths" value={profile.goalMonths} onChange={handleNumber} />

          <label className="gp-field">
            <span className="gp-label">If your savings dropped 10–20%, you would feel</span>
            <select
              value={profile.riskComfort}
              onChange={(e) => update({ ...profile, riskComfort: e.target.value })}
            >
              <option value="low">Uncomfortable. I prefer safety.</option>
              <option value="medium">Uneasy, but I could wait it out.</option>
              <option value="high">Fine. I can handle ups and downs.</option>
            </select>
            <span className="gp-hint">Used later to shortlist investment options.</span>
          </label>
        </form>

        <div className="gp-results">
          <div className="gp-card">
            <h2>What you can set aside</h2>
            <p className="gp-big">{formatINR(available)}<span> left after essentials each month</span></p>
            <p className="gp-muted">We suggest starting with about {formatINR(suggested)} so you keep some room for surprises.</p>

            <label className="gp-field">
              <span className="gp-label">Your monthly contribution: <strong>{formatINR(profile.monthlyContribution)}</strong></span>
              <input
                type="range"
                min="0"
                max={Math.max(available, 100)}
                step="50"
                value={Math.min(profile.monthlyContribution, Math.max(available, 100))}
                onChange={(e) => update({ ...profile, monthlyContribution: Number(e.target.value) })}
              />
            </label>

            <div className={`gp-status gp-${status}`} role="status">
              <strong>{STATUS[status].title}</strong>
              <p>{STATUS[status].text(profile, required)}</p>
              <p className="gp-muted">
                {gap === 0
                  ? 'You have already reached this goal.'
                  : months === null
                  ? 'Set a monthly contribution to see how long this takes.'
                  : `At ${formatINR(profile.monthlyContribution)} a month, you reach ${formatINR(profile.goalAmount)} in about ${months} month${months === 1 ? '' : 's'}.`}
              </p>
            </div>

            <div className="gp-bar" aria-label={`Goal progress ${progress}%`}>
              <div style={{ width: `${progress}%` }} />
            </div>
            <p className="gp-muted">{formatINR(profile.existingSavings)} of {formatINR(profile.goalAmount)} saved ({progress}%)</p>
          </div>

          <div className="gp-card">
            <h2>Your goal ladder</h2>
            <ol className="gp-ladder">
              {milestones.map((m, i) => (
                <li key={m.id} className={m.done ? 'gp-done' : i === firstOpen ? 'gp-current' : ''}>
                  <div>
                    <strong>{m.title}</strong>
                    {m.target !== null && <span className="gp-target">{formatINR(m.target)}</span>}
                    <p>{m.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="gp-note">
              Illustrative milestones. Projections are estimates, investments can lose value, and this is not financial advice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
>>>>>>> origin/main
}
