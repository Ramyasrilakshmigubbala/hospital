
import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, Phone, Mail } from 'lucide-react';

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
  createdAt: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export default function AppointmentsManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch doctors
      const doctorsSnapshot = await getDocs(collection(db, 'doctors'));
      const doctorsData: Record<string, Doctor> = {};
      doctorsSnapshot.docs.forEach(doc => {
        doctorsData[doc.id] = {
          id: doc.id,
          name: doc.data().name,
          specialty: doc.data().specialty
        };
      });
      setDoctors(doctorsData);

      // Fetch appointments
      const appointmentsQuery = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), { status: newStatus });
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
      toast({
        title: "Status Updated",
        description: `Appointment status has been updated to ${newStatus}.`
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the appointment status.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">All Appointments ({appointments.length})</h3>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No appointments found.</p>
        </div>
      ) : (
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
                  {new Date(appointment.date).toLocaleDateString()}
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
                  <p className="text-sm font-medium text-gray-900 mb-1">Reason:</p>
                  <p className="text-sm text-gray-600">{appointment.reason}</p>
                </div>
                {appointment.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-gray-900 mb-1">Notes:</p>
                    <p className="text-sm text-gray-600">{appointment.notes}</p>
                  </div>
                )}
                <div className="pt-2">
                  <label className="text-sm font-medium text-gray-900 mb-2 block">
                    Update Status:
                  </label>
                  <Select
                    value={appointment.status}
                    onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
