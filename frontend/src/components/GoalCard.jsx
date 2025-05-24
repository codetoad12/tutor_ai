import React, { useState } from 'react';
import { goalService } from '../services/goalService';
import { 
    FiCalendar, 
    FiCheckCircle, 
    FiCircle, 
    FiPaperclip, 
    FiClock, 
    FiTrash2,
    FiEdit3,
    FiAlertTriangle
} from 'react-icons/fi';

const GoalCard = ({ goal, attachments, onToggle, onDelete }) => {
    const [isToggling, setIsToggling] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleToggle = async () => {
        if (isToggling) return;
        setIsToggling(true);
        try {
            await onToggle();
        } finally {
            setIsToggling(false);
        }
    };

    const handleDelete = () => {
        setShowDeleteConfirm(false);
        onDelete();
    };

    const daysUntilDeadline = goalService.getDaysUntilDeadline(goal.deadline);
    const isOverdue = goalService.isGoalOverdue(goal.deadline);
    const formattedDate = goalService.formatDate(goal.deadline);

    // Calculate progress percentage (for now, based on completion status)
    const progressPercentage = goal.is_completed ? 100 : Math.max(10, Math.min(90, (7 - Math.abs(daysUntilDeadline)) / 7 * 100));

    const getDeadlineColor = () => {
        if (goal.is_completed) return 'text-green-600';
        if (isOverdue) return 'text-red-600';
        if (daysUntilDeadline <= 2) return 'text-orange-600';
        return 'text-gray-600';
    };

    const getDeadlineText = () => {
        if (goal.is_completed) return 'Completed';
        if (isOverdue) return `Overdue by ${Math.abs(daysUntilDeadline)} day${Math.abs(daysUntilDeadline) !== 1 ? 's' : ''}`;
        if (daysUntilDeadline === 0) return 'Due today';
        if (daysUntilDeadline === 1) return 'Due tomorrow';
        return `${daysUntilDeadline} days left`;
    };

    return (
        <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-l-4 ${
            goal.is_completed ? 'border-green-500' : isOverdue ? 'border-red-500' : 'border-indigo-500'
        }`}>
            <div className="p-6">
                {/* Header with title and actions */}
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex-1 mr-3">
                        {goal.title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleToggle}
                            disabled={isToggling}
                            className={`transition-colors duration-200 ${
                                isToggling ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                            }`}
                        >
                            {goal.is_completed ? (
                                <FiCheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                                <FiCircle className="h-6 w-6 text-gray-400 hover:text-indigo-500" />
                            )}
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                            <FiTrash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Description */}
                {goal.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {goal.description}
                    </p>
                )}

                {/* Progress Bar */}
                {!goal.is_completed && (
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-700">Progress</span>
                            <span className="text-xs text-gray-500">{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    isOverdue ? 'bg-red-500' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Footer with deadline and attachments */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                        {/* Deadline */}
                        <div className="flex items-center gap-1">
                            <FiCalendar className={`h-4 w-4 ${getDeadlineColor()}`} />
                            <span className={`text-sm font-medium ${getDeadlineColor()}`}>
                                {formattedDate}
                            </span>
                        </div>

                        {/* Time indicator */}
                        <div className="flex items-center gap-1">
                            {isOverdue ? (
                                <FiAlertTriangle className="h-4 w-4 text-red-500" />
                            ) : (
                                <FiClock className="h-4 w-4 text-gray-400" />
                            )}
                            <span className={`text-xs ${getDeadlineColor()}`}>
                                {getDeadlineText()}
                            </span>
                        </div>
                    </div>

                    {/* Attachments count */}
                    <div className="flex items-center gap-1">
                        <FiPaperclip className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                            {attachments.length} file{attachments.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Delete Goal
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete "{goal.title}"? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoalCard; 