import React, { useState, useEffect } from 'react';
import { goalService } from '../services/goalService';
import GoalCard from './GoalCard';
import CreateGoalModal from './CreateGoalModal';
import { FiPlus, FiTarget, FiCalendar, FiTrendingUp } from 'react-icons/fi';

const ProgressTrackerPage = () => {
    const [goals, setGoals] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchGoalsAndAttachments();
    }, []);

    const fetchGoalsAndAttachments = async () => {
        try {
            setLoading(true);
            console.log('Fetching goals and attachments...'); // Debug log
            const [goalsData, attachmentsData] = await Promise.all([
                goalService.getGoals(),
                goalService.getGoalAttachments()
            ]);
            
            console.log('Goals data received:', goalsData); // Debug log
            console.log('Attachments data received:', attachmentsData); // Debug log
            
            // Ensure we always have arrays
            setGoals(Array.isArray(goalsData) ? goalsData : []);
            setAttachments(Array.isArray(attachmentsData) ? attachmentsData : []);
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
            // Set empty arrays on error to prevent crashes
            setGoals([]);
            setAttachments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGoalCreated = () => {
        console.log('Goal created, refreshing data...'); // Debug log
        fetchGoalsAndAttachments();
        setShowCreateModal(false);
    };

    const handleGoalToggle = async (goalId) => {
        try {
            await goalService.toggleGoalCompletion(goalId);
            fetchGoalsAndAttachments();
        } catch (err) {
            console.error('Error toggling goal:', err);
            setError(err.message);
        }
    };

    const handleGoalDelete = async (goalId) => {
        try {
            await goalService.deleteGoal(goalId);
            fetchGoalsAndAttachments();
        } catch (err) {
            console.error('Error deleting goal:', err);
            setError(err.message);
        }
    };

    // Filter goals for current week
    const getCurrentWeekGoals = () => {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        
        return goals.filter(goal => {
            const goalDate = new Date(goal.deadline);
            return goalDate >= startOfWeek && goalDate <= endOfWeek;
        });
    };

    // Get stats - add safety checks
    const completedGoals = Array.isArray(goals) ? goals.filter(goal => goal.is_completed).length : 0;
    const totalGoals = Array.isArray(goals) ? goals.length : 0;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        📊 Your Personal Progress Tracker
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Track your UPSC preparation week-by-week and stay focused on your goals.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Goals</p>
                                <p className="text-3xl font-bold text-indigo-600">{totalGoals}</p>
                            </div>
                            <FiTarget className="h-8 w-8 text-indigo-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-3xl font-bold text-green-600">{completedGoals}</p>
                            </div>
                            <FiCalendar className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                                <p className="text-3xl font-bold text-purple-600">{completionRate}%</p>
                            </div>
                            <FiTrendingUp className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Weekly Goals Overview
                    </h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-md"
                    >
                        <FiPlus className="h-5 w-5" />
                        Add New Goal
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        <p className="font-medium">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Goals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {!Array.isArray(goals) || goals.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <FiTarget className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-xl font-medium text-gray-500 mb-2">No goals yet</p>
                            <p className="text-gray-400 mb-6">Create your first goal to start tracking your progress</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center gap-2"
                            >
                                <FiPlus className="h-5 w-5" />
                                Create Your First Goal
                            </button>
                        </div>
                    ) : (
                        goals.map(goal => {
                            const goalAttachments = Array.isArray(attachments) ? attachments.filter(att => att.goal === goal.id) : [];
                            return (
                                <GoalCard
                                    key={goal.id}
                                    goal={goal}
                                    attachments={goalAttachments}
                                    onToggle={() => handleGoalToggle(goal.id)}
                                    onDelete={() => handleGoalDelete(goal.id)}
                                />
                            );
                        })
                    )}
                </div>

                {/* Create Goal Modal */}
                {showCreateModal && (
                    <CreateGoalModal
                        onClose={() => setShowCreateModal(false)}
                        onGoalCreated={handleGoalCreated}
                    />
                )}
            </div>
        </div>
    );
};

export default ProgressTrackerPage; 