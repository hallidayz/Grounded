import React, { useState, useEffect } from 'react';
import { EmailSchedule } from '../types';
import { saveEmailSchedule, getEmailSchedule, shouldSendScheduledEmail, shareViaEmail, generateEmailReport, generateGoalsEmail } from '../services/emailService';
import { LogEntry, Goal, ValueItem } from '../types';

interface EmailScheduleProps {
  userId?: string;
  logs?: LogEntry[];
  goals?: Goal[];
  values?: ValueItem[];
  schedule: EmailSchedule | undefined;
  onUpdate: (schedule: EmailSchedule) => void;
  onClose: () => void;
}

const EmailScheduleComponent: React.FC<EmailScheduleProps> = ({
  userId = '',
  logs = [],
  goals = [],
  values = [],
  schedule,
  onUpdate,
  onClose
}) => {
  const [enabled, setEnabled] = useState(schedule?.enabled || false);
  const [frequency, setFrequency] = useState<EmailSchedule['frequency']>(schedule?.frequency || 'weekly');
  const [time, setTime] = useState(schedule?.time || '09:00');
  const [dayOfWeek, setDayOfWeek] = useState(schedule?.dayOfWeek ?? 0);
  const [dayOfMonth, setDayOfMonth] = useState(schedule?.dayOfMonth ?? 1);
  const [recipientEmails, setRecipientEmails] = useState(schedule?.recipientEmails?.join('\n') || '');
  const [sendGoalCompletions, setSendGoalCompletions] = useState(schedule?.sendGoalCompletions ?? true);
  const [sendReports, setSendReports] = useState(schedule?.sendReports ?? true);

  const handleSave = () => {
    const emailList = recipientEmails.split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

    const newSchedule: EmailSchedule = {
      enabled,
      frequency,
      time,
      dayOfWeek,
      dayOfMonth,
      recipientEmails: emailList,
      sendGoalCompletions,
      sendReports,
      lastSent: schedule?.lastSent
    };

    if (userId) {
      saveEmailSchedule(userId, newSchedule);
    }
    onUpdate(newSchedule);
    onClose();
  };

  const handleTestEmail = async () => {
    const emailList = recipientEmails.split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

    if (emailList.length === 0) {
      alert('Please add at least one valid email address');
      return;
    }

    let emailData;
    if (sendReports && logs.length > 0) {
      emailData = generateEmailReport(logs.slice(0, 10), values);
    } else {
      const completedGoals = goals.filter(g => g.completed);
      emailData = generateGoalsEmail(goals, values, completedGoals);
    }

    emailData.subject = `[TEST] ${emailData.subject}`;
    emailData.body = `This is a test email from Grounded by AC MiNDS.\n\n${emailData.body}`;

    const success = await shareViaEmail(emailData, emailList);
    if (success) {
      alert('Test email opened! Check your email client.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-bg-primary w-full max-w-2xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-text-primary dark:text-white tracking-tight">
                Email Schedule
              </h2>
              <p className="text-sm text-text-secondary dark:text-text-secondary mt-1">
                Automatically send summaries to your therapist
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-4 bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-border-soft dark:border-dark-border">
              <div className="flex-1">
                <label className="text-sm font-black text-text-primary dark:text-white block mb-1">
                  Enable Email Schedule
                </label>
                <p className="text-xs text-text-secondary dark:text-text-secondary">
                  Automatically send summaries at scheduled times
                </p>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`w-16 h-8 rounded-full transition-all relative flex-shrink-0 ${enabled ? 'bg-navy-primary' : 'bg-border-soft dark:bg-dark-border'}`}
                aria-label={enabled ? 'Disable email schedule' : 'Enable email schedule'}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${enabled ? 'left-9' : 'left-1'}`} />
              </button>
            </div>

            {enabled && (
              <>
                {/* Frequency */}
                <div>
                  <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-3">
                    Frequency
                  </label>
                  <div className="flex gap-2">
                    {(['daily', 'weekly', 'monthly'] as EmailSchedule['frequency'][]).map(freq => (
                      <button
                        key={freq}
                        onClick={() => setFrequency(freq)}
                        className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all border ${
                          frequency === freq
                            /* PREV: bg-yellow-warm text-navy-primary ... border-yellow-warm */
                            ? 'bg-brand dark:bg-brand-light text-white dark:text-navy-dark shadow-sm border-brand dark:border-brand-light'
                            : 'bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white border-border-soft dark:border-dark-border hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time, Day, Date */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-3">
                      Send Time
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-bg-secondary dark:bg-dark-bg-secondary border border-border-soft dark:border-dark-border focus:ring-2 focus:ring-navy-primary/30 dark:focus:ring-navy-primary/50 outline-none text-text-primary dark:text-white font-bold"
                    />
                  </div>

                  {frequency === 'weekly' && (
                    <div>
                      <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-3">
                        Day of Week
                      </label>
                      <select
                        value={dayOfWeek}
                        onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl bg-bg-secondary dark:bg-dark-bg-secondary border border-border-soft dark:border-dark-border focus:ring-2 focus:ring-navy-primary/30 dark:focus:ring-navy-primary/50 outline-none text-text-primary dark:text-white font-bold"
                      >
                        <option value={0}>Sunday</option>
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                      </select>
                    </div>
                  )}

                  {frequency === 'monthly' && (
                    <div>
                      <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-3">
                        Day of Month (1-31)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={dayOfMonth}
                        onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl bg-bg-secondary dark:bg-dark-bg-secondary border border-border-soft dark:border-dark-border focus:ring-2 focus:ring-navy-primary/30 dark:focus:ring-navy-primary/50 outline-none text-text-primary dark:text-white font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* Recipient Emails */}
                <div>
                  <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-3">
                    Therapist Email(s)
                  </label>
                  <p className="text-xs text-text-secondary dark:text-text-secondary mb-2">
                    One email address per line. You can add multiple recipients.
                  </p>
                  <textarea
                    value={recipientEmails}
                    onChange={(e) => setRecipientEmails(e.target.value)}
                    placeholder="therapist@example.com&#10;lcsw@example.com&#10;supervisor@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-bg-secondary dark:bg-dark-bg-secondary border border-border-soft dark:border-dark-border focus:ring-2 focus:ring-navy-primary/30 dark:focus:ring-navy-primary/50 outline-none text-text-primary dark:text-white min-h-[100px] resize-none text-sm"
                  />
                  {recipientEmails && (
                    <div className="mt-2 p-2 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg">
                      <p className="text-xs text-text-secondary dark:text-text-secondary">
                        {recipientEmails.split('\n').filter(email => email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())).length} valid email(s) entered
                      </p>
                    </div>
                  )}
                </div>

                {/* What to Send */}
                <div className="space-y-3">
                  <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest">
                    What to Include
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-border-soft dark:border-dark-border hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors">
                    <input
                      type="checkbox"
                      checked={sendReports}
                      onChange={(e) => setSendReports(e.target.checked)}
                      /* PREV: text-yellow-warm focus:ring-yellow-warm/50 */
                      className="mt-1 w-5 h-5 rounded border-2 border-text-primary/30 dark:border-white/30 text-brand dark:text-brand-light focus:ring-2 focus:ring-brand/50 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-bold text-text-primary dark:text-white block">
                        Clinical Reports
                      </span>
                      <span className="text-xs text-text-secondary dark:text-text-secondary">
                        Include SOAP/DAP/BIRP formatted summaries
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-border-soft dark:border-dark-border hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors">
                    <input
                      type="checkbox"
                      checked={sendGoalCompletions}
                      onChange={(e) => setSendGoalCompletions(e.target.checked)}
                      /* PREV: text-yellow-warm focus:ring-yellow-warm/50 */
                      className="mt-1 w-5 h-5 rounded border-2 border-text-primary/30 dark:border-white/30 text-brand dark:text-brand-light focus:ring-2 focus:ring-brand/50 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-bold text-text-primary dark:text-white block">
                        Goal Completions
                      </span>
                      <span className="text-xs text-text-secondary dark:text-text-secondary">
                        Send email when goals are completed
                      </span>
                    </div>
                  </label>
                </div>

                {/* Test Email */}
                <button
                  onClick={handleTestEmail}
                  /* PREV: bg-yellow-warm/20 ... text-yellow-warm */
                  className="w-full py-3 bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light rounded-xl text-sm font-black uppercase tracking-widest hover:bg-brand/20 dark:hover:bg-brand/30 border border-brand/30 dark:border-brand/50"
                >
                  Send Test Email
                </button>
              </>
            )}

            {schedule?.lastSent && (
              <div className="p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-border-soft dark:border-dark-border">
                <p className="text-xs text-text-secondary dark:text-text-secondary">
                  Last sent: {new Date(schedule.lastSent).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary border border-border-soft dark:border-dark-border"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-navy-primary text-white rounded-xl text-sm font-black uppercase tracking-widest hover:opacity-90 shadow-lg border border-navy-primary"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailScheduleComponent;

