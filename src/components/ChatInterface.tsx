/**
 * Chat Interface Component
 * 
 * Provides a chat interface for user "brain dump" with automatic triage routing.
 * Features:
 * - Automatic triage on first message
 * - "Switching to..." animation when routing
 * - Session memory indicator
 * - 60-Second Grounding button accessible during chat
 * - Crisis detection and response
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { startCounselingSessionWithTriage, continueCounselingSession, type CounselingSession } from '../services/ai/specializedCounseling';
import { CrisisResponse } from '../services/safetyService';
import { loadLastSessionToken } from '../services/ai/sessionMemory';
import { getCurrentUser } from '../services/authService';
import CrisisCard from './CrisisCard';
import GroundingTool from './GroundingTool';
import { logger } from '../utils/logger';

interface ChatInterfaceProps {
  onClose?: () => void;
  initialMessage?: string;
}

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose, initialMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState(initialMessage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routingFramework, setRoutingFramework] = useState<string | null>(null);
  const [session, setSession] = useState<CounselingSession | null>(null);
  const [showCrisisCard, setShowCrisisCard] = useState(false);
  const [crisisResponse, setCrisisResponse] = useState<CrisisResponse | null>(null);
  const [showGrounding, setShowGrounding] = useState(false);
  const [hasSessionMemory, setHasSessionMemory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check for session memory on mount
  useEffect(() => {
    const checkSessionMemory = async () => {
      try {
        const user = await getCurrentUser();
        if (user?.id) {
          const token = await loadLastSessionToken(user.id);
          setHasSessionMemory(!!token);
        }
      } catch (error) {
        logger.error('[ChatInterface] Error checking session memory:', error);
      }
    };
    checkSessionMemory();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const message = inputValue.trim();
    if (!message || isLoading) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // If this is the first message, use triage routing
      if (messages.length === 0) {
        setIsRouting(true);
        const result = await startCounselingSessionWithTriage(message);
        
        // Check for crisis response
        if (typeof result.response === 'object' && 'isCrisis' in result.response) {
          setCrisisResponse(result.response);
          setShowCrisisCard(true);
          setIsLoading(false);
          setIsRouting(false);
          return;
        }

        // Show routing animation
        if (result.handover) {
          // Import getCategoryDisplayName to show routing framework
          const { getCategoryDisplayName } = await import('../services/ai/triageRouter');
          // Use category if available, otherwise derive from framework
          const category = result.category || 'OVERWHELM';
          setRoutingFramework(getCategoryDisplayName(category as any));
          await new Promise(resolve => setTimeout(resolve, 1500)); // Show routing message
        }

        setIsRouting(false);
        setRoutingFramework(null);

        // Create session
        const newSession: CounselingSession = {
          promptType: result.framework,
          messages: [
            { role: 'user', content: message, timestamp: userMessage.timestamp },
            { role: 'assistant', content: result.response as string, timestamp: new Date().toISOString() },
          ],
        };
        setSession(newSession);

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.response as string,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Continue existing session
        if (!session) {
          logger.error('[ChatInterface] No session found for continuation');
          return;
        }

        const result = await continueCounselingSession(session, message);

        // Check for crisis response
        if (typeof result === 'object' && 'isCrisis' in result) {
          setCrisisResponse(result);
          setShowCrisisCard(true);
          setIsLoading(false);
          return;
        }

        // Update session
        const updatedSession: CounselingSession = {
          ...session,
          messages: [
            ...session.messages,
            { role: 'user', content: message, timestamp: userMessage.timestamp },
            { role: 'assistant', content: result as string, timestamp: new Date().toISOString() },
          ],
        };
        setSession(updatedSession);

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result as string,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      logger.error('[ChatInterface] Error in chat:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or use the 60-Second Reset if you need immediate support.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGroundingComplete = (action: 'coach' | 'better' | 'more-help') => {
    setShowGrounding(false);
    if (action === 'coach') {
      // User wants to continue with coach - focus input
      inputRef.current?.focus();
    } else if (action === 'more-help') {
      // Show crisis resources
      setShowCrisisCard(true);
    }
    // If 'better', just close the grounding tool
  };

  if (showCrisisCard && crisisResponse) {
    return (
      <CrisisCard
        onClose={() => {
          setShowCrisisCard(false);
          setCrisisResponse(null);
        }}
        showQuickExit={crisisResponse.isDomesticViolence}
      />
    );
  }

  if (showGrounding) {
    return <GroundingTool onComplete={handleGroundingComplete} onClose={() => setShowGrounding(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary dark:bg-dark-bg-primary flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-dark-bg-secondary border-b border-border-soft dark:border-dark-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">
            Protected Space
          </h2>
          {hasSessionMemory && (
            <span className="text-xs text-text-secondary dark:text-white/70 bg-bg-secondary dark:bg-dark-bg-tertiary px-2 py-1 rounded">
              Previous session available
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrounding(true)}
            className="px-3 py-1.5 bg-yellow-warm dark:bg-yellow-warm text-navy-dark font-bold text-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            🧘 60-Second Reset
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-secondary dark:hover:bg-dark-bg-tertiary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-text-secondary dark:text-white/70 mb-4">
              This is your Protected Space. Share what's on your mind, and I'll help you find the right support.
            </p>
            <p className="text-sm text-text-tertiary dark:text-white/50">
              Your words stay here, encrypted and unjudged.
            </p>
          </div>
        )}

        <AnimatePresence>
          {isRouting && routingFramework && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-navy-primary/10 dark:bg-yellow-warm/10 rounded-xl p-4 text-center"
            >
              <p className="text-sm text-text-primary dark:text-white">
                Switching to <span className="font-bold">{routingFramework}</span>...
              </p>
            </motion.div>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-navy-primary dark:bg-yellow-warm text-white dark:text-navy-dark'
                    : 'bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-bg-secondary dark:bg-dark-bg-secondary rounded-2xl p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-text-secondary dark:text-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-text-secondary dark:text-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-text-secondary dark:text-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-dark-bg-secondary border-t border-border-soft dark:border-dark-border p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="flex-1 resize-none rounded-xl p-3 bg-bg-secondary dark:bg-dark-bg-tertiary text-text-primary dark:text-white border border-border-soft dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-navy-primary dark:focus:ring-yellow-warm"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-navy-primary dark:bg-yellow-warm text-white dark:text-navy-dark font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-text-tertiary dark:text-white/50 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
