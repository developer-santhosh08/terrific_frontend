import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Plus } from '@phosphor-icons/react';

export type EventType = 'purple' | 'success' | 'warning';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, type: EventType) => void;
    selectedDate: Date;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, selectedDate }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<EventType>('purple');

    const handleSave = () => {
        if (title.trim()) {
            onSave(title, type);
            setTitle('');
            setType('purple');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="tw-fixed tw-inset-0 tw-z-[9999] tw-flex tw-items-center tw-justify-center tw-p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="tw-absolute tw-inset-0 tw-bg-slate-900/60 tw-backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="tw-relative tw-w-full tw-max-w-md tw-bg-white/95 tw-backdrop-blur-xl tw-rounded-[2.5rem] tw-shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] tw-border tw-border-white/20 tw-overflow-hidden"
                    >
                        <div className="tw-p-10">
                            <div className="tw-flex tw-items-center tw-justify-between tw-mb-8">
                                <div>
                                    <h3 className="tw-text-2xl tw-font-black tw-text-slate-900 tw-tracking-tight">Add Event</h3>
                                    <p className="tw-text-slate-400 tw-text-sm tw-font-medium">Plan your schedule</p>
                                </div>
                                <motion.div
                                    whileHover={{ rotate: 15, scale: 1.1 }}
                                    className="tw-bg-indigo-600 tw-p-3 tw-rounded-2xl tw-shadow-lg tw-shadow-indigo-200"
                                >
                                    <CalendarIcon weight="duotone" className="tw-w-7 tw-h-7 tw-text-white" />
                                </motion.div>
                            </div>

                            <div className="tw-space-y-8">
                                <div>
                                    <label className="tw-block tw-text-[10px] tw-font-black tw-text-slate-400 tw-uppercase tw-tracking-[0.2em] tw-mb-3">Event Title</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Design Sync"
                                        className="tw-w-full tw-px-5 tw-py-4 tw-bg-slate-50 tw-border tw-border-slate-100 tw-rounded-2xl focus:tw-outline-none focus:tw-ring-4 focus:tw-ring-indigo-500/10 focus:tw-border-indigo-500 tw-transition-all tw-text-slate-700 tw-font-semibold tw-placeholder-slate-300"
                                    />
                                </div>

                                <div>
                                    <label className="tw-block tw-text-[10px] tw-font-black tw-text-slate-400 tw-uppercase tw-tracking-[0.2em] tw-mb-3">Category</label>
                                    <div className="tw-flex tw-gap-4">
                                        {(['purple', 'success', 'warning'] as EventType[]).map(catType => (
                                            <motion.button
                                                key={catType}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setType(catType)}
                                                className={`
                                                    tw-flex-1 tw-py-3 tw-rounded-2xl tw-border-2 tw-transition-all tw-flex tw-items-center tw-justify-center
                                                    ${type === catType ? 'tw-border-indigo-500 tw-bg-indigo-50' : 'tw-border-transparent tw-bg-slate-50'}
                                                `}
                                            >
                                                <div className={`
                                                    tw-w-5 tw-h-5 tw-rounded-full tw-shadow-sm
                                                    ${catType === 'purple' ? 'tw-bg-purple-500' : ''}
                                                    ${catType === 'success' ? 'tw-bg-emerald-500' : ''}
                                                    ${catType === 'warning' ? 'tw-bg-amber-500' : ''}
                                                `} />
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <div className="tw-flex tw-gap-4 tw-pt-6">
                                    <motion.button
                                        whileHover={{ backgroundColor: "rgba(241, 245, 249, 1)" }}
                                        onClick={onClose}
                                        className="tw-flex-1 tw-py-4 tw-text-slate-400 tw-font-bold tw-rounded-2xl tw-transition-all"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02, backgroundColor: "#4338ca" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSave}
                                        disabled={!title}
                                        className="tw-flex-1 tw-py-4 tw-bg-indigo-600 tw-text-white tw-font-bold tw-rounded-2xl hover:tw-bg-indigo-700 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed tw-shadow-[0_20px_40px_-12px_rgba(79,70,229,0.4)] tw-transition-all tw-flex tw-items-center tw-justify-center tw-gap-2"
                                    >
                                        <Plus weight="bold" className="tw-w-4 tw-h-4" /> Save
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EventModal;
