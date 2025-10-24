'use client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { addHours, format, parseISO } from 'date-fns';
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
export const EventForm = ({ date, pets, onSave, onCancel, event }) => {
    // Set default time 1 hour from now, rounded to nearest 30 minutes
    const getDefaultTime = (date) => {
        const now = new Date(date);
        now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
        return now;
    };
    const [title, setTitle] = useState(event?.title || '');
    const [description, setDescription] = useState(event?.description || '');
    const [startDate, setStartDate] = useState(event?.start
        ? format(parseISO(event.start.toISOString()), 'yyyy-MM-dd')
        : format(date, 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState(event?.start
        ? format(parseISO(event.start.toISOString()), 'HH:mm')
        : format(getDefaultTime(date), 'HH:mm'));
    const [endDate, setEndDate] = useState(event?.end
        ? format(parseISO(event.end.toISOString()), 'yyyy-MM-dd')
        : format(date, 'yyyy-MM-dd'));
    const [endTime, setEndTime] = useState(event?.end
        ? format(parseISO(event.end.toISOString()), 'HH:mm')
        : format(addHours(getDefaultTime(date), 1), 'HH:mm'));
    const [eventType, setEventType] = useState(event?.type || 'playdate');
    const [selectedPets, setSelectedPets] = useState(event?.petIds || []);
    const [location, setLocation] = useState(event?.location || '');
    const [allDay, setAllDay] = useState(event?.allDay || false);
    const handlePetToggle = (petId) => {
        if (selectedPets.includes(petId)) {
            setSelectedPets(selectedPets.filter((id) => id !== petId));
        }
        else {
            setSelectedPets([...selectedPets, petId]);
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // Create start and end dates by combining the date and time
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);
        onSave({
            title,
            description,
            start,
            end,
            type: eventType,
            petIds: selectedPets,
            location,
            allDay,
        });
    };
    const eventTypes = [
        { value: 'playdate', label: '🐾 Playdate', color: 'bg-pink-500' },
        { value: 'vet', label: '🏥 Vet Visit', color: 'bg-blue-500' },
        { value: 'grooming', label: '🧼 Grooming', color: 'bg-purple-500' },
        { value: 'training', label: '🏋️ Training', color: 'bg-green-500' },
        { value: 'other', label: '📅 Other', color: 'bg-gray-500' },
    ];
    return (<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {event ? 'Edit Event' : 'Create Event'}
        </h2>
        <button onClick={onCancel} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <XMarkIcon className="w-5 h-5"/>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title*
          </label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Event title" required/>
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Event Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {eventTypes.map((type) => (<button key={type.value} type="button" className={`p-2 rounded-lg border border-transparent text-center text-sm transition-colors ${eventType === type.value
                ? `${type.color} text-white border-white`
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`} onClick={() => setEventType(type.value)}>
                {type.label}
              </button>))}
          </div>
        </div>

        {/* Date and Time */}
        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              All Day
            </label>
            <button type="button" className={`ml-2 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${allDay ? 'bg-pink-600' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => setAllDay(!allDay)}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allDay ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date*
              </label>
              <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required/>
            </div>

            {!allDay && (<div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time*
                </label>
                <input type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required/>
              </div>)}

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date*
              </label>
              <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required/>
            </div>

            {!allDay && (<div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time*
                </label>
                <input type="time" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required/>
              </div>)}
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Add location"/>
        </div>

        {/* Pets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Pets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {pets.map((pet) => (<button key={pet.id} type="button" onClick={() => handlePetToggle(pet.id)} className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${selectedPets.includes(pet.id)
                ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {pet.avatar ? (<img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover"/>) : (<span className="text-lg">🐾</span>)}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{pet.name}</span>
              </button>))}
          </div>
        </div>

        {/* Description */}
        <div>
          <Textarea id="description" value={description} onChange={setDescription} rows={3} variant="outline" size="medium" autoGrow={true} maxHeight={150} label="Description" placeholder="Add description" showWordCount={true} animateOnFocus={true}/>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button type="submit" className="flex-1 py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors">
            {event ? 'Save Changes' : 'Create Event'}
          </button>
          <button type="button" onClick={onCancel} className="py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>);
};
export default EventForm;
//# sourceMappingURL=EventForm.jsx.map