import React from 'react';
import { Link } from 'react-router-dom';
import { FaNewspaper, FaBook, FaChartLine, FaComments } from 'react-icons/fa';

const FeatureCard = ({ title, description, icon, path, color }) => {
  return (
    <Link 
      to={path}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-200 hover:-translate-y-1 transform"
    >
      <div className={`h-2 ${color}`}></div>
      <div className="p-6">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${color.replace('bg-', 'bg-').replace('500', '100')} ${color.replace('bg-', 'text-')}`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
};

const LandingPage = () => {
  const features = [
    {
      title: 'Daily Brief',
      description: 'Get your daily dose of current affairs carefully curated for UPSC aspirants',
      icon: <FaNewspaper className="text-2xl" />,
      path: '/daily-brief',
      color: 'bg-blue-500'
    },
    {
      title: 'Latest News',
      description: 'Stay updated with the latest news and events from around the world',
      icon: <FaBook className="text-2xl" />,
      path: '/news',
      color: 'bg-green-500'
    },
    {
      title: 'Current Affairs',
      description: 'Explore a comprehensive collection of current affairs for your UPSC preparation',
      icon: <FaChartLine className="text-2xl" />,
      path: '/current-affairs',
      color: 'bg-purple-500'
    },
    {
      title: 'AI Chat Assistant',
      description: 'Get personalized help with your UPSC preparation questions',
      icon: <FaComments className="text-2xl" />,
      path: '/chat',
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to AI Tutor</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your comprehensive platform for UPSC preparation with AI-powered features and regularly updated current affairs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        <div className="mt-16 bg-white rounded-xl shadow-md p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Updates</h2>
          <div className="border-l-4 border-blue-500 pl-4 py-2 mb-4">
            <p className="text-gray-700">
              <span className="font-semibold">Daily Brief:</span> Updated with the latest current affairs for June 14, 2024
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2 mb-4">
            <p className="text-gray-700">
              <span className="font-semibold">New Feature:</span> AI Chat Assistant is now available to help with your preparation
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <p className="text-gray-700">
              <span className="font-semibold">Coming Soon:</span> Weekly quizzes to test your knowledge on recent events
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 