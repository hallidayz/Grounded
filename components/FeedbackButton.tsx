import React, { useState } from 'react';

interface FeedbackButtonProps {
  className?: string;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({ className = '' }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const emojis = [
    { emoji: '😍', label: 'Love it' },
    { emoji: '😊', label: 'Happy' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😕', label: 'Unhappy' },
    { emoji: '😢', label: 'Very unhappy' },
  ];

  const handleSubmit = () => {
    if (!selectedEmoji && !feedback.trim()) {
      return; // At least one required
    }

    const emojiLabel = emojis.find(e => e.emoji === selectedEmoji)?.label || 'None';
    const subject = encodeURIComponent('Grounded App Feedback');
    const body = encodeURIComponent(
      `Feedback for Grounded App\n\n` +
      `Rating: ${selectedEmoji || 'None'} (${emojiLabel})\n\n` +
      `Feedback:\n${feedback.trim() || '(No additional feedback provided)'}\n\n` +
      `---\n` +
      `App Version: 1.12.26\n` +
      `Timestamp: ${new Date().toISOString()}`
    );

    const mailtoLink = `mailto:ac.minds.ai@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;

    setSubmitted(true);
    setTimeout(() => {
      setShowModal(false);
      setSubmitted(false);
      setSelectedEmoji(null);
      setFeedback('');
    }, 2000);
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setShowModal(true)}
        className={`
          fixed bottom-20 right-4 sm:bottom-6 sm:right-6
          w-14 h-14 sm:w-16 sm:h-16
          bg-navy-primary dark:bg-navy-primary
          text-white
          rounded-full
          shadow-2xl
          flex items-center justify-center
          hover:scale-110 active:scale-95
          transition-all duration-200
          z-40
          ${className}
        `}
        aria-label="Send Feedback"
        title="Send Feedback"
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </button>

      {/* Feedback Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fade-in"
          onClick={() => !submitted && setShowModal(false)}
        >
          <div 
            className="bg-white dark:bg-dark-bg-primary w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-pop relative border border-border-soft dark:border-dark-border"
            onClick={(e) => e.stopPropagation()}
          >
            {!submitted ? (
              <>
                {/* Header */}
                <div className="p-6 border-b border-border-soft dark:border-dark-border flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-text-primary dark:text-white">Send Feedback</h2>
                    <p className="text-sm text-text-secondary dark:text-text-secondary mt-1">
                      Help us improve Grounded
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Emoji Selection */}
                  <div>
                    <label className="text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-3 block">
                      How do you feel about Grounded?
                    </label>
                    <div className="flex items-center justify-around gap-2">
                      {emojis.map((item) => (
                        <button
                          key={item.emoji}
                          onClick={() => setSelectedEmoji(item.emoji)}
                          className={`
                            flex flex-col items-center justify-center
                            w-16 h-16 sm:w-20 sm:h-20
                            rounded-2xl
                            transition-all duration-200
                            ${selectedEmoji === item.emoji
                              ? 'bg-yellow-warm dark:bg-yellow-warm scale-110 shadow-lg'
                              : 'bg-bg-secondary dark:bg-dark-bg-secondary hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                            }
                            active:scale-95
                          `}
                          aria-label={item.label}
                        >
                          <span className="text-3xl sm:text-4xl mb-1">{item.emoji}</span>
                          <span className={`text-[9px] font-semibold ${
                            selectedEmoji === item.emoji
                              ? 'text-text-primary dark:text-text-primary'
                              : 'text-text-secondary dark:text-text-secondary'
                          }`}>
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div>
                    <label className="text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-3 block">
                      Additional Feedback (Optional)
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Tell us what you think, what you'd like to see, or any issues you've encountered..."
                      className="w-full p-4 rounded-2xl bg-bg-secondary dark:bg-dark-bg-secondary border border-border-soft dark:border-dark-border focus:ring-2 focus:ring-navy-primary/30 dark:focus:ring-navy-primary/50 outline-none text-text-primary dark:text-white min-h-[120px] resize-none text-sm"
                      maxLength={1000}
                    />
                    <p className="text-xs text-text-tertiary dark:text-text-tertiary mt-2 text-right">
                      {feedback.length}/1000
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border-soft dark:border-dark-border">
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedEmoji && !feedback.trim()}
                    className={`
                      w-full px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest
                      transition-all
                      ${selectedEmoji || feedback.trim()
                        ? 'bg-navy-primary text-white hover:opacity-90 shadow-lg'
                        : 'bg-bg-secondary dark:bg-dark-bg-secondary text-text-tertiary dark:text-text-tertiary cursor-not-allowed'
                      }
                    `}
                  >
                    Send Feedback
                  </button>
                  <p className="text-xs text-text-tertiary dark:text-text-tertiary text-center mt-3">
                    Opens your email client to send feedback
                  </p>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✅</span>
                </div>
                <h3 className="text-xl font-black text-text-primary dark:text-white mb-2">
                  Thank You!
                </h3>
                <p className="text-sm text-text-secondary dark:text-text-secondary">
                  Your feedback has been prepared. Check your email client to send it.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;

