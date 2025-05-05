import React, { useState, useEffect } from 'react';
import { currentAffairsService } from '../../services/currentAffairsService';

const CurrentAffairsList = () => {
    const [currentAffairs, setCurrentAffairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        category: ''
    });

    useEffect(() => {
        fetchCurrentAffairs();
    }, [filters]);

    const fetchCurrentAffairs = async () => {
        try {
            setLoading(true);
            const data = await currentAffairsService.getCurrentAffairs(filters);
            setCurrentAffairs(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch current affairs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Current Affairs</h1>
            
            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                        type="date"
                        name="start_date"
                        value={filters.start_date}
                        onChange={handleFilterChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                        type="date"
                        name="end_date"
                        value={filters.end_date}
                        onChange={handleFilterChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                        type="text"
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        placeholder="Enter category"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Current Affairs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentAffairs.map((affair) => (
                    <div key={affair.id} className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-2">{affair.title}</h2>
                        <p className="text-gray-600 mb-2">{new Date(affair.date).toLocaleDateString()}</p>
                        <p className="text-sm text-indigo-600 mb-2">{affair.category}</p>
                        <p className="text-gray-700 mb-4">{affair.summary}</p>
                        
                        {affair.key_concepts && (
                            <div className="mb-4">
                                <h3 className="font-medium mb-1">Key Concepts:</h3>
                                <p className="text-sm text-gray-600">{affair.key_concepts}</p>
                            </div>
                        )}
                        
                        {affair.usage_hint && (
                            <div>
                                <h3 className="font-medium mb-1">Usage Hint:</h3>
                                <p className="text-sm text-gray-600">{affair.usage_hint}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CurrentAffairsList; 