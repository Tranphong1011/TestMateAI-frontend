'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SunIcon, CloudIcon, BoltIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  userName: string;
  date: string;
}

const getWeatherIcon = (condition: string | null) => {
  if (!condition) return <SunIcon className="w-6 h-6" />;

  const lowerCaseCondition = condition.toLowerCase();
  if (lowerCaseCondition.includes('sun') || lowerCaseCondition.includes('clear')) {
    return <SunIcon className="w-6 h-6" />;
  } else if (lowerCaseCondition.includes('cloud') || lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle')) {
    return <CloudIcon className="w-6 h-6" />;
  } else if (lowerCaseCondition.includes('storm')) {
    return <BoltIcon className="w-6 h-6" />;
  }
  return <SunIcon className="w-6 h-6" />;
};

const Header: React.FC<HeaderProps> = ({ userName, date }) => {
  const [currentTemperature, setCurrentTemperature] = useState<number | null>(null);
  const [weatherCondition, setWeatherCondition] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const simulatedData = { temp: 18, condition: 'Partly Cloudy' };
        setCurrentTemperature(simulatedData.temp);
        setWeatherCondition(simulatedData.condition);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error("Weather fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return (
    <div className="bg-white w-full px-6 py-4">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span>/</span>
        <Link href="/my-projects" className="hover:text-gray-700">My Projects</Link>
        <span className="ml-1">...</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Good morning, {userName}</h1>
          <p className="text-gray-500 text-sm">{date}</p>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-600">
          {isLoading ? (
            <span>Loading weather...</span>
          ) : error ? (
            <span title={error}>Weather unavailable</span>
          ) : (
            <>
              {getWeatherIcon(weatherCondition)}
              <span className="text-lg">{currentTemperature}°C</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header; 