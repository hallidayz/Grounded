import React, { useState, useEffect } from 'react';
import { EmailSchedule } from '../types';
import { saveEmailSchedule, getEmailSchedule, shouldSendScheduledEmail, shareViaEmail, generateEmailReport, generateGoalsEmail } from '../services/emailService';
import { LogEntry, Goal, ValueItem } from '../types';

interface EmailScheduleProps {
  userId: string;
  logs: LogEntry[];
  goals: Goal[];
  values: ValueItem[];
  schedule: EmailSchedule | undefined;
  onUpdate: (schedule: EmailSchedule) => void;
  onClose: () => void;
}

const EmailScheduleComponent: React.FC<EmailScheduleProps> = ({
  userId,
  logs,
  goals,
  values,
  schedule,
  onUpdate,
  onClose
}) => {
  const [enabled, setEnabled] = useState(schedule?.enabled || false);
  const [frequency, setFrequency] = useState<EmailSchedule['frequency']>(schedule?.frequency || 'weekly');
  const [time, setTime] = useState(schedule?.time || '09:00');
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
      recipientEmails: emailList,
      sendGoalCompletions,
      sendReports,
      lastSent: schedule?.lastSent
    };

    saveEmailSchedule(userId, newSchedule);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-executive-depth w-full max-w-2xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-authority-navy dark:text-pure-foundation tracking-tight">
                Email Schedule
              </h2>
              <p className="text-sm text-authority-navy/60 dark:text-pure-foundation/60 mt-1">
                Automatically send summaries to your therapist
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-pure-foundation dark:bg-executive-depth/50 text-authority-navy/60 dark:text-pure-foundation/60 hover:text-authority-navy dark:hover:text-pure-foundation"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-4 bg-pure-foundation dark:bg-executive-depth/50 rounded-xl">
              <div>
                <label className="text-sm font-black text-authority-navy dark:text-pure-foundation block mb-1">
                  Enable Email Schedule
                </label>
                <p className="text-xs text-authority-navy/60 dark:text-pure-foundation/60">
                  Automatically send summaries at scheduled times
                </p>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`w-16 h-8 rounded-full transition-all relative ${enabled ? 'bg-brand-accent' : 'bg-slate-200 dark:bg-executive-depth'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${enabled ? 'left-9' : 'left-1'}`} />
              </button>
            </div>

            {enabled && (
              <>
                {/* Frequency */}
                <div>
                  <label className="block text-xs font-black text-authority-navy dark:text-pure-foundation uppercase tracking-widest mb-3">
                    Frequency
                  </label>
                  <div className="flex gap-2">
                    {(['daily', 'weekly', 'monthly'] as EmailSchedule['frequency'][]).map(freq => (
                      <button
                        key={freq}
                        onClick={() => setFrequency(freq)}
                        className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                          frequency === freq
                            ? 'bg-brand-accent text-authority-navy shadow-sm'
                            : 'bg-pure-foundation dark:bg-executive-depth/50 text-authority-navy/60 dark:text-pure-foundation/60'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-xs font-black text-authority-navy dark:text-pure-foundation uppercase tracking-widest mb-3">
                    Send Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-pure-foundation dark:bg-executive-depth/50 border-none focus:ring-2 focus:ring-brand-accent/50 outline-none text-authority-navy dark:text-pure-foundation font-bold"
                  />
                </div>

                {/* Recipient Emails */}
                <div>
                  <label className="block text-xs font-black text-authority-navy dark:text-pure-foundation uppercase tracking-widest mb-3">
                    Therapist Email(s)
                  </label>
                  <p className="text-xs text-authority-navy/60 dark:text-pure-foundation/60 mb-2">
                    One email address per line
                  </p>
                  <textarea
                    value={recipientEmails}
                    onChange={(e) => setRecipientEmails(e.target.value)}
                    placeholder="therapist@example.com&#10;lcsw@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-pure-foundation dark:bg-executive-depth/50 border-none focus:ring-2 focus:ring-brand-accent/50 outline-none text-authority-navy dark:text-pure-foundation min-h-[100px] resize-none text-sm"
                  />
                </div>

                {/* What to Send */}
                <div className="space-y-3">
                  <label className="block text-xs font-black text-authority-navy dark:text-pure-foundation uppercase tracking-widest">
                    What to Include
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-pure-foundation dark:bg-executive-depth/50 rounded-xl">
                    <input
                      type="checkbox"
                      checked={sendReports}
                      onChange={(e) => setSendReports(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-2 border-authority-navy/30 dark:border-pure-foundation/30 text-brand-accent focus:ring-2 focus:ring-brand-accent/50 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-bold text-authority-navy dark:text-pure-foundation block">
                        Clinical Reports
                      </span>
                      <span className="text-xs text-authority-navy/60 dark:text-pure-foundation/60">
                        Include SOAP/DAP/BIRP formatted summaries
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-pure-foundation dark:bg-executive-depth/50 rounded-xl">
                    <input
                      type="checkbox"
                      checked={sendGoalCompletions}
                      onChange={(e) => setSendGoalCompletions(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-2 border-authority-navy/30 dark:border-pure-foundation/30 text-brand-accent focus:ring-2 focus:ring-brand-accent/50 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-bold text-authority-navy dark:text-pure-foundation block">
                        Goal Completions
                      </span>
                      <span className="text-xs text-authority-navy/60 dark:text-pure-foundation/60">
                        Send email when goals are completed
                      </span>
                    </div>
                  </label>
                </div>

                {/* Test Email */}
                <button
                  onClick={handleTestEmail}
                  className="w-full py-3 bg-brand-accent/20 dark:bg-brand-accent/30 text-brand-accent rounded-xl text-sm font-black uppercase tracking-widest hover:bg-brand-accent/30 dark:hover:bg-brand-accent/40"
                >
                  Send Test Email
                </button>
              </>
            )}

            {schedule?.lastSent && (
              <div className="p-3 bg-pure-foundation dark:bg-executive-depth/50 rounded-xl">
                <p className="text-xs text-authority-navy/60 dark:text-pure-foundation/60">
                  Last sent: {new Date(schedule.lastSent).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-pure-foundation dark:bg-executive-depth/50 text-authority-navy dark:text-pure-foundation rounded-xl text-sm font-black uppercase tracking-widest hover:opacity-80"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-brand-accent text-authority-navy rounded-xl text-sm font-black uppercase tracking-widest hover:opacity-90 shadow-lg"
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

