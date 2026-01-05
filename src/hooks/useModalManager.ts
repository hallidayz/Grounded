import { useState, useCallback } from 'react';

export type ModalType = 'help' | 'lcswConfig' | 'migration' | 'unlock' | null;

export function useModalManager() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = useCallback((modal: ModalType) => {
    setActiveModal(modal);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const isModalOpen = useCallback((modal: ModalType) => {
    return activeModal === modal;
  }, [activeModal]);

  // Convenience methods for specific modals
  const openHelp = useCallback(() => openModal('help'), [openModal]);
  const openLCSWConfig = useCallback(() => openModal('lcswConfig'), [openModal]);
  const openMigration = useCallback(() => openModal('migration'), [openModal]);
  const openUnlock = useCallback(() => openModal('unlock'), [openModal]);

  const closeHelp = useCallback(() => {
    if (activeModal === 'help') closeModal();
  }, [activeModal, closeModal]);

  const closeLCSWConfig = useCallback(() => {
    if (activeModal === 'lcswConfig') closeModal();
  }, [activeModal, closeModal]);

  const closeMigration = useCallback(() => {
    if (activeModal === 'migration') closeModal();
  }, [activeModal, closeModal]);

  const closeUnlock = useCallback(() => {
    if (activeModal === 'unlock') closeModal();
  }, [activeModal, closeModal]);

  return {
    activeModal,
    openModal,
    closeModal,
    isModalOpen,
    // Specific modal helpers
    openHelp,
    openLCSWConfig,
    openMigration,
    openUnlock,
    closeHelp,
    closeLCSWConfig,
    closeMigration,
    closeUnlock,
    // Legacy compatibility - boolean getters
    showHelp: activeModal === 'help',
    showLCSWConfig: activeModal === 'lcswConfig',
    showMigrationScreen: activeModal === 'migration',
    showUnlockScreen: activeModal === 'unlock',
  };
}

