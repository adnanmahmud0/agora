"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Video,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Zap,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  Check,
  MoreVertical,
  XCircle,
  Trash,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { createMeeting, fetchMyMeetings, CreateMeetingRequest, closeMeeting, deleteMeeting, joinMeeting } from '@/integration/meetings';
import { fetchUsers } from '@/integration/users';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

type MeetingType = 'instant' | 'scheduled';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  initials: string;
  role: string;
}

interface MeetingFormData {
  participantId: string;
  meetingType: MeetingType;
  title: string;
  startDate?: Date;
  startTime?: string;
  endTime?: string;
}

interface Meeting {
  creator: {
    id: string;
    name: string;
    email: string;
  };
  participant: {
    id: string;
    name: string;
    email: string;
  };
  meetingType: 'instant' | 'scheduled';
  startTime: string | null;
  endTime: string | null;
  roomId: string;
  joinLink: string;
  status: 'ongoing' | 'completed' | 'scheduled';
}

//

export default function App() {
  const { logout } = useAuth();
  const router = useRouter();
  const [meetingType, setMeetingType] = useState<MeetingType>('instant');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdMeetingId, setCreatedMeetingId] = useState('');
  const [createdJoinLink, setCreatedJoinLink] = useState('');
  const [openUserSelect, setOpenUserSelect] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinChannelName, setJoinChannelName] = useState('');
  const [joinToken, setJoinToken] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  
  const [formData, setFormData] = useState<MeetingFormData>({
    participantId: '',
    meetingType: 'instant',
    title: '',
    startDate: undefined,
    startTime: '',
    endTime: '',
  });

  const handleInputChange = <K extends keyof MeetingFormData>(field: K, value: MeetingFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.participantId.trim()) {
      setErrorMessage('Participant ID is required');
      return false;
    }
    if (!formData.title.trim()) {
      setErrorMessage('Meeting title is required');
      return false;
    }
    if (meetingType === 'scheduled') {
      if (!formData.startDate) {
        setErrorMessage('Start date is required for scheduled meetings');
        return false;
      }
      if (!formData.startTime) {
        setErrorMessage('Start time is required for scheduled meetings');
        return false;
      }
      if (!formData.endTime) {
        setErrorMessage('End time is required for scheduled meetings');
        return false;
      }
    }
    return true;
  };

  const createMeetingPayload = (): CreateMeetingRequest => {
    if (meetingType === 'instant') {
      return {
        participantId: formData.participantId,
        meetingType: 'instant',
        title: formData.title,
      };
    } else {
      // Combine date and time for scheduled meetings
      const startDateTime = new Date(formData.startDate!);
      const [startHour, startMinute] = formData.startTime!.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0);

      const endDateTime = new Date(formData.startDate!);
      const [endHour, endMinute] = formData.endTime!.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0);

      return {
        participantId: formData.participantId,
        meetingType: 'scheduled',
        title: formData.title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    setShowSuccess(false);

    if (!validateForm()) {
      setShowError(true);
      return;
    }

    setIsLoading(true);

    try {
      const payload = createMeetingPayload();
      const data = await createMeeting(payload);
      setCreatedMeetingId(data.id);
      setCreatedJoinLink(data.joinLink);
      setShowSuccess(true);

      setFormData({
        participantId: '',
        meetingType: 'instant',
        title: '',
        startDate: undefined,
        startTime: '',
        endTime: '',
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create meeting');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMeetingTypeChange = (type: string) => {
    const newType = type as MeetingType;
    setMeetingType(newType);
    handleInputChange('meetingType', newType);
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    handleInputChange('participantId', user.id);
    setOpenUserSelect(false);
  };

  // Fetch meetings from API
  const fetchMeetings = async () => {
    setMeetingsLoading(true);
    try {
      const list = await fetchMyMeetings();
      setMeetings(list);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setMeetingsLoading(false);
    }
  };

  const handleCloseMeeting = async (roomId: string) => {
    try {
      setMeetingsLoading(true);
      await closeMeeting(roomId);
      await fetchMeetings();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to close meeting');
      setShowError(true);
    } finally {
      setMeetingsLoading(false);
    }
  };

  const handleDeleteMeeting = async (roomId: string) => {
    try {
      setMeetingsLoading(true);
      await deleteMeeting(roomId);
      await fetchMeetings();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete meeting');
      setShowError(true);
    } finally {
      setMeetingsLoading(false);
    }
  };

  const handleJoinMeeting = async (roomId: string) => {
    try {
      setJoinLoading(true);
      const { token, channelName } = await joinMeeting(roomId);
      setJoinToken(token);
      setJoinChannelName(channelName);
      setIsJoinOpen(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to join meeting');
      setShowError(true);
    } finally {
      setJoinLoading(false);
    }
  };

  // Fetch meetings on component mount
  useEffect(() => {
    fetchMeetings();
  }, []);

  // Fetch users for participant selection
  useEffect(() => {
    const run = async () => {
      try {
        const list = await fetchUsers();
        setUsersList(
          list.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            avatar: u.avatar,
            role: u.role,
            initials: getInitials(u.name),
          }))
        );
      } catch {
      }
    };
    run();
  }, []);

  // Refresh meetings after creating a new one
  useEffect(() => {
    if (showSuccess) {
      fetchMeetings();
    }
  }, [showSuccess]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="fixed top-4 right-4 z-50">
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 bg-blue-600 rounded-full mb-4">
            <Video className="size-8 text-white" />
          </div>
          <h1 className="mb-2">Create New Meeting</h1>
          <p className="text-gray-600">Start an instant meeting or schedule one for later</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Details</CardTitle>
                <CardDescription>
                  Fill in the information below to create your meeting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Meeting Type Selector */}
                  <div className="space-y-2">
                    <Label>Meeting Type</Label>
                    <Tabs value={meetingType} onValueChange={handleMeetingTypeChange} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="instant" className="gap-2">
                          <Zap className="size-4" />
                          Instant Meeting
                        </TabsTrigger>
                        <TabsTrigger value="scheduled" className="gap-2">
                          <CalendarClock className="size-4" />
                          Scheduled Meeting
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Participant ID */}
                  <div className="space-y-2">
                    <Label htmlFor="participantId">
                      Select Participant <span className="text-red-500">*</span>
                    </Label>
                    <Popover open={openUserSelect} onOpenChange={setOpenUserSelect}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openUserSelect}
                          className="w-full justify-between"
                          disabled={isLoading}
                        >
                          {selectedUser ? (
                            <div className="flex items-center gap-3">
                              <Avatar className="size-6">
                                <AvatarImage src={selectedUser.avatar} />
                                <AvatarFallback className="text-xs">{selectedUser.initials}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col items-start">
                                <span>{selectedUser.name}</span>
                                <span className="text-xs text-gray-500">{selectedUser.role}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Select a participant...</span>
                          )}
                          <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <div className="max-h-[300px] overflow-auto">
                          {usersList.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => handleUserSelect(user)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors text-left"
                            >
                              <Avatar className="size-10">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.initials}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="truncate">{user.name}</p>
                                <p className="text-sm text-gray-600 truncate">{user.role}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              </div>
                              {selectedUser?.id === user.id && (
                                <Check className="size-5 text-blue-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <p className="text-sm text-gray-500">Choose a participant for the meeting</p>
                  </div>

                  {/* Meeting Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Meeting Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder={meetingType === 'instant' ? 'e.g., Quick Sync' : 'e.g., Design Review'}
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Scheduled Meeting Fields */}
                  {meetingType === 'scheduled' && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-900 mb-2">
                        <CalendarIcon className="size-5" />
                        <span>Schedule Details</span>
                      </div>

                      {/* Start Date */}
                      <div className="space-y-2">
                        <Label htmlFor="startDate">
                          Meeting Date <span className="text-red-500">*</span>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left"
                              disabled={isLoading}
                            >
                              <CalendarIcon className="mr-2 size-4" />
                              {formData.startDate ? (
                                format(formData.startDate, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.startDate}
                              onSelect={(date) => handleInputChange('startDate', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Time Inputs */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startTime">
                            Start Time <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                            <Input
                              id="startTime"
                              type="time"
                              className="pl-10"
                              value={formData.startTime}
                              onChange={(e) => handleInputChange('startTime', e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endTime">
                            End Time <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                            <Input
                              id="endTime"
                              type="time"
                              className="pl-10"
                              value={formData.endTime}
                              onChange={(e) => handleInputChange('endTime', e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {showError && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="size-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-red-900">Error</p>
                        <p className="text-sm text-red-700">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {showSuccess && (
                    <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="size-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-green-900">Meeting Created Successfully!</p>
                        <p className="text-sm text-green-700">Meeting ID: {createdMeetingId}</p>
                        {createdJoinLink && (
                          <p className="text-sm text-green-700 break-all">Join Link: {createdJoinLink}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setFormData({
                          participantId: '',
                          meetingType: 'instant',
                          title: '',
                          startDate: undefined,
                          startTime: '',
                          endTime: '',
                        });
                        setSelectedUser(null);
                        setShowError(false);
                        setShowSuccess(false);
                      }}
                      disabled={isLoading}
                    >
                      Reset
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Video className="size-4 mr-2" />
                          Create Meeting
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Info Cards */}
          <div className="space-y-6">
            {/* Meetings List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">My Meetings</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchMeetings}
                    disabled={meetingsLoading}
                  >
                    <RefreshCw className={`size-4 ${meetingsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <CardDescription>
                  Recent meetings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {meetingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-gray-400" />
                  </div>
                ) : meetings.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {meetings.map((meeting) => (
                      <div
                        key={meeting.roomId}
                        className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                      >
                        {/* Status Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getStatusColor(meeting.status)}`}
                          >
                            {meeting.status}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {meeting.meetingType}
                            </span>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="size-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48" align="end">
                                <div className="flex flex-col gap-2">
                                  <Button
                                    variant="ghost"
                                    className="justify-start"
                                    onClick={() => handleCloseMeeting(meeting.roomId)}
                                    disabled={meetingsLoading}
                                  >
                                    <XCircle className="size-4 mr-2" />
                                    Close Meeting
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="justify-start text-red-600 hover:text-red-700"
                                    onClick={() => handleDeleteMeeting(meeting.roomId)}
                                    disabled={meetingsLoading}
                                  >
                                    <Trash className="size-4 mr-2" />
                                    Delete Meeting
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        {/* Participant Info */}
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="size-10">
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {getInitials(meeting.participant.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="truncate">
                              {meeting.participant.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {meeting.participant.email}
                            </p>
                          </div>
                        </div>

                        {/* Meeting Details */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Users className="size-3.5" />
                            <span>Creator: {meeting.creator.name}</span>
                          </div>
                          {meeting.startTime && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Clock className="size-3.5" />
                              <span>{format(new Date(meeting.startTime), 'PPp')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Video className="size-3.5" />
                            <span className="truncate">Room: {meeting.roomId}</span>
                          </div>
                        </div>

                        {/* Join Button */}
                        {meeting.status === 'ongoing' && meeting.joinLink && (
                          <Button
                            className="w-full"
                            size="sm"
                            onClick={() => handleJoinMeeting(meeting.roomId)}
                            disabled={joinLoading}
                          >
                            <Video className="size-4 mr-2" />
                            {joinLoading ? 'Loading...' : 'Join Meeting'}
                          </Button>
                        )}

                        {meeting.status === 'completed' && (
                          <div className="text-center py-2 text-xs text-gray-500 bg-gray-50 rounded">
                            Meeting ended
                          </div>
                        )}

                        {meeting.status === 'scheduled' && (
                          <Button
                            className="w-full"
                            size="sm"
                            variant="outline"
                            disabled
                          >
                            <CalendarClock className="size-4 mr-2" />
                            Scheduled
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="size-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No meetings found</p>
                    <p className="text-xs text-gray-400 mt-1">Create your first meeting</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {isJoinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Join Meeting</CardTitle>
              <CardDescription>Confirm to join this channel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Channel:</span> {joinChannelName}
                </div>
                <div className="text-xs text-gray-500 break-all p-2 bg-gray-50 rounded border">
                  {joinToken}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button
                className="flex-1"
                disabled={joinLoading}
                onClick={() => {
                  setIsJoinOpen(false);
                  router.push(`/meeting?channelName=${encodeURIComponent(joinChannelName)}&token=${encodeURIComponent(joinToken)}`);
                }}
              >
                Join Now
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setIsJoinOpen(false)}>Not Now</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
