import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Video, Phone, AlertCircle, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
const virtualMeetupSchema = z.object({
    scheduledDate: z.string().min(1, 'Please select a date and time'),
    duration: z
        .number()
        .min(15, 'Minimum duration is 15 minutes')
        .max(120, 'Maximum duration is 2 hours'),
    platform: z.enum(['zoom', 'google_meet', 'phone', 'video_call']),
    meetingLink: z.string().url().optional(),
    phoneNumber: z.string().optional(),
    agenda: z.array(z.string()).min(1, 'Please add at least one agenda item'),
    notes: z.string().optional(),
});
export const VirtualMeetupScheduler = ({ petId, applicantId, shelterId, applicationId, onSchedule, existingMeetups = [], }) => {
    const [isScheduling, setIsScheduling] = useState(false);
    const [agendaItems, setAgendaItems] = useState(['']);
    const [selectedPlatform, setSelectedPlatform] = useState('zoom');
    const { register, handleSubmit, watch, setValue, formState: { errors }, } = useForm({
        resolver: zodResolver(virtualMeetupSchema),
        defaultValues: {
            duration: 30,
            platform: 'zoom',
            agenda: [''],
        },
    });
    const watchedPlatform = watch('platform');
    const watchedScheduledDate = watch('scheduledDate');
    const addAgendaItem = () => {
        setAgendaItems([...agendaItems, '']);
    };
    const removeAgendaItem = (index) => {
        if (agendaItems.length > 1) {
            const newItems = agendaItems.filter((_, i) => i !== index);
            setAgendaItems(newItems);
            setValue('agenda', newItems);
        }
    };
    const updateAgendaItem = (index, value) => {
        const newItems = [...agendaItems];
        newItems[index] = value;
        setAgendaItems(newItems);
        setValue('agenda', newItems.filter((item) => item.trim() !== ''));
    };
    const onFormSubmit = async (data) => {
        setIsScheduling(true);
        try {
            await onSchedule(data);
        }
        finally {
            setIsScheduling(false);
        }
    };
    const getPlatformIcon = (platform) => {
        switch (platform) {
            case 'zoom':
            case 'google_meet':
            case 'video_call':
                return <Video className="h-4 w-4"/>;
            case 'phone':
                return <Phone className="h-4 w-4"/>;
            default:
                return <Video className="h-4 w-4"/>;
        }
    };
    const getPlatformName = (platform) => {
        switch (platform) {
            case 'zoom':
                return 'Zoom';
            case 'google_meet':
                return 'Google Meet';
            case 'video_call':
                return 'Video Call';
            case 'phone':
                return 'Phone Call';
            default:
                return platform;
        }
    };
    const getMinDateTime = () => {
        const now = new Date();
        now.setHours(now.getHours() + 1); // At least 1 hour from now
        return now.toISOString().slice(0, 16); // Format for datetime-local input
    };
    return (<div className="space-y-6">
      {/* Existing Meetups */}
      {existingMeetups.length > 0 && (<Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5"/>
              Scheduled Meetups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {existingMeetups.map((meetup) => (<div key={meetup._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(meetup.platform)}
                      <span className="font-medium">{getPlatformName(meetup.platform)}</span>
                      <Badge variant={meetup.status === 'completed'
                    ? 'default'
                    : meetup.status === 'scheduled'
                        ? 'secondary'
                        : meetup.status === 'cancelled'
                            ? 'destructive'
                            : 'outline'}>
                        {meetup.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(meetup.scheduledDate).toLocaleDateString()} at{' '}
                      {new Date(meetup.scheduledDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">Duration: {meetup.duration} minutes</div>

                  {meetup.agenda.length > 0 && (<div className="mt-2">
                      <div className="text-sm font-medium">Agenda:</div>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {meetup.agenda.map((item, index) => (<li key={index}>{item}</li>))}
                      </ul>
                    </div>)}

                  {meetup.meetingLink && (<div className="mt-2">
                      <a href={meetup.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        Join Meeting
                      </a>
                    </div>)}
                </div>))}
            </div>
          </CardContent>
        </Card>)}

      {/* Schedule New Meetup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5"/>
            Schedule Virtual Meetup
          </CardTitle>
          <CardDescription>
            Schedule a virtual meeting with the potential adopter to discuss the adoption.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4"/>
              <AlertDescription>
                Virtual meetups help both parties get to know each other better before finalizing an
                adoption. Meetings typically last 30-60 minutes and can be conducted via video call
                or phone.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Date & Time *</Label>
                <Input id="scheduledDate" type="datetime-local" {...register('scheduledDate')} min={getMinDateTime()}/>
                {errors.scheduledDate && (<p className="text-sm text-red-500">{errors.scheduledDate.message}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Select value={watch('duration')?.toString()} onValueChange={(value) => setValue('duration', parseInt(value, 10))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
                {errors.duration && (<p className="text-sm text-red-500">{errors.duration.message}</p>)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Meeting Platform *</Label>
              <Select value={watchedPlatform} onValueChange={(value) => {
            setValue('platform', value);
            setSelectedPlatform(value);
        }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="google_meet">Google Meet</SelectItem>
                  <SelectItem value="video_call">Other Video Call</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                </SelectContent>
              </Select>
              {errors.platform && <p className="text-sm text-red-500">{errors.platform.message}</p>}
            </div>

            {(watchedPlatform === 'zoom' ||
            watchedPlatform === 'google_meet' ||
            watchedPlatform === 'video_call') && (<div className="space-y-2">
                <Label htmlFor="meetingLink">
                  Meeting Link{' '}
                  {watchedPlatform === 'zoom'
                ? '(Zoom)'
                : watchedPlatform === 'google_meet'
                    ? '(Google Meet)'
                    : '(Video Call)'}
                </Label>
                <Input id="meetingLink" {...register('meetingLink')} placeholder="https://zoom.us/j/123456789"/>
                {errors.meetingLink && (<p className="text-sm text-red-500">{errors.meetingLink.message}</p>)}
              </div>)}

            {watchedPlatform === 'phone' && (<div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input id="phoneNumber" {...register('phoneNumber')} placeholder="(555) 123-4567"/>
                {errors.phoneNumber && (<p className="text-sm text-red-500">{errors.phoneNumber.message}</p>)}
              </div>)}

            {/* Agenda Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Meeting Agenda *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAgendaItem}>
                  Add Agenda Item
                </Button>
              </div>

              {agendaItems.map((item, index) => (<div key={index} className="flex gap-2">
                  <Input value={item} onChange={(e) => updateAgendaItem(index, e.target.value)} placeholder={`Agenda item ${index + 1}...`}/>
                  {agendaItems.length > 1 && (<Button type="button" variant="outline" size="sm" onClick={() => removeAgendaItem(index)}>
                      Remove
                    </Button>)}
                </div>))}

              {errors.agenda && <p className="text-sm text-red-500">{errors.agenda.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" {...register('notes')} placeholder="Any special instructions or notes for the meeting..." rows={3}/>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isScheduling}>
                {isScheduling ? 'Scheduling...' : 'Schedule Meetup'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Meeting Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Virtual Meetup Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">For Adopters:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Prepare questions about the pet's personality and needs</li>
                  <li>• Have a quiet, private space for the call</li>
                  <li>• Be honest about your lifestyle and experience</li>
                  <li>• Take notes during the conversation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">For Shelters:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Introduce the pet and share their story</li>
                  <li>• Discuss the pet's routine and requirements</li>
                  <li>• Answer questions about care and behavior</li>
                  <li>• Assess the adopter's preparedness</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);
};
//# sourceMappingURL=VirtualMeetupScheduler.jsx.map
//# sourceMappingURL=VirtualMeetupScheduler.jsx.map