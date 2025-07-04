
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, User, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  patientName: string;
  email: string;
  phone: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  notes?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export default function PatientPortal() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDoctors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'doctors'));
      const doctorsData: Record<string, Doctor> = {};
      querySnapshot.docs.forEach(doc => {
        doctorsData[doc.id] = {
          id: doc.id,
          name: doc.data().name,
          specialty: doc.data().specialty
        };
      });
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const searchAppointments = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to view appointments.",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(searchEmail.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Searching appointments for email:', searchEmail.trim());
      const q = query(collection(db, 'appointments'), where('email', '==', searchEmail.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);
      const appointmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      
      console.log('Found appointments:', appointmentsData);
      setAppointments(appointmentsData);
      
      if (appointmentsData.length === 0) {
        toast({
          title: "No Appointments Found",
          description: "No appointments found for this email address."
        });
      } else {
        toast({
          title: "Appointments Found",
          description: `Found ${appointmentsData.length} appointment(s) for your email.`
        });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Search Failed",
        description: "There was an error searching for appointments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Patient Portal</h1>
          <p className="text-lg text-gray-600">
            View your appointments and manage your healthcare information.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Find Your Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchAppointments()}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the email address you used when booking your appointment
                </p>
              </div>
              <div className="flex items-end">
                <Button onClick={searchAppointments} disabled={loading}>
                  {loading ? 'Searching...' : 'Search Appointments'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {appointments.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Appointments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {doctors[appointment.doctorId] 
                          ? `Dr. ${doctors[appointment.doctorId].name}`
                          : 'Doctor Information'
                        }
                      </CardTitle>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </div>
                    {doctors[appointment.doctorId] && (
                      <p className="text-sm text-gray-600">{doctors[appointment.doctorId].specialty}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {appointment.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      {appointment.patientName}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {appointment.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {appointment.phone}
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium text-gray-900 mb-1">Reason for Visit:</p>
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                    </div>
                    {appointment.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium text-gray-900 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {searchEmail && appointments.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-lg p-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Appointments Found</h2>
              <p className="text-gray-600">No appointments found for the provided email address.</p>
              <p className="text-sm text-gray-500 mt-2">
                Make sure you entered the same email address used when booking your appointment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
