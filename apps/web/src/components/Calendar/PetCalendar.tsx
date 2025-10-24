'use client';
import React, { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO, } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
export const PetCalendar = ({ events = [], onEventClick, onDateClick, onAddEvent, }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeDate, setActiveDate] = useState(new Date());
    const prevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };
    const nextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };
    const getEventColors = (type) => {
        switch (type) {
            case 'playdate':
                return 'bg-pink-500';
            case 'vet':
                return 'bg-blue-500';
            case 'grooming':
                return 'bg-purple-500';
            case 'training':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };
    const getEventIcon = (type) => {
        switch (type) {
            case 'playdate':
                return '🐾';
            case 'vet':
                return '🏥';
            case 'grooming':
                return '🧼';
            case 'training':
                return '🏋️';
            default:
                return '📅';
        }
    };
    const renderHeader = () => {
        return (<div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
        </button>
        <h2 className="font-bold text-xl text-gray-900 dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
        </button>
      </div>);
    };
    const renderDays = () => {
        const days = [];
        const startDate = startOfWeek(currentDate);
        for (let i = 0; i < 7; i++) {
            days.push(<div key={i} className="font-semibold text-center text-sm text-gray-600 dark:text-gray-400 py-2">
          {format(addDays(startDate, i), 'EEE')}
        </div>);
        }
        return <div className="grid grid-cols-7">{days}</div>;
    };
    const renderCells = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startDate = startOfWeek(monthStart);
        const rows = [];
        let days = [];
        let day = startDate;
        for (let i = 0; i < 42; i++) {
            const formattedDate = format(day, 'yyyy-MM-dd');
            const cloneDay = day;
            // Filter events for this day
            const dayEvents = events.filter((event) => isSameDay(parseISO(event.start.toISOString()), cloneDay));
            days.push(<div key={formattedDate} className={`min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 ${!isSameMonth(day, monthStart)
                    ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50'
                    : 'text-gray-900 dark:text-white'} ${isSameDay(day, new Date())
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : ''} ${isSameDay(day, activeDate) ? 'ring-2 ring-pink-500 dark:ring-pink-600' : ''}`} onClick={() => {
                    setActiveDate(cloneDay);
                    onDateClick?.(cloneDay);
                }}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'text-blue-600 dark:text-blue-400' : ''}`}>
              {format(day, 'd')}
            </span>

            {isSameMonth(day, monthStart) && (<button onClick={(e) => {
                        e.stopPropagation();
                        onAddEvent?.(cloneDay);
                    }} className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-pink-500 hover:text-white flex items-center justify-center text-xs transition-colors">
                +
              </button>)}
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            {dayEvents.slice(0, 3).map((event) => (<div key={event.id} className={`text-xs p-1 rounded truncate text-white ${getEventColors(event.type)} cursor-pointer`} onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                    }}>
                <span className="mr-1">{getEventIcon(event.type)}</span>
                {event.title}
              </div>))}
            {dayEvents.length > 3 && (<div className="text-xs text-center text-gray-500 dark:text-gray-400">
                +{dayEvents.length - 3} more
              </div>)}
          </div>
        </div>);
            if ((i + 1) % 7 === 0) {
                rows.push(<div key={`row-${i}`} className="grid grid-cols-7">
            {days}
          </div>);
                days = [];
            }
            day = addDays(day, 1);
        }
        return <div className="space-y-1">{rows}</div>;
    };
    // Filter today's events
    const todaysEvents = useMemo(() => {
        return events.filter((event) => isSameDay(parseISO(event.start.toISOString()), new Date()));
    }, [events]);
    return (<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>

      {/* Today's Events */}
      {todaysEvents.length > 0 && (<div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Today's Events</h3>
          <div className="space-y-2">
            {todaysEvents.map((event) => (<div key={event.id} className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors" onClick={() => onEventClick?.(event)}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getEventColors(event.type)}`}>
                  <span className="text-lg">{getEventIcon(event.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {event.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {format(parseISO(event.start.toISOString()), 'h:mm a')} -{' '}
                    {format(parseISO(event.end.toISOString()), 'h:mm a')}
                  </p>
                </div>
              </div>))}
          </div>
        </div>)}
    </div>);
};
export default PetCalendar;
//# sourceMappingURL=PetCalendar.jsx.map