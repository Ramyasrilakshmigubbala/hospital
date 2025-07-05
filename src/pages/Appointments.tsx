import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Modal } from '@/components/ui/modal';
import { format } from 'date-fns';
import { CalendarIcon, Clock, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  consultationFee?: number;
}

interface AppointmentData {
  patientName: string;
  email: string;
  phone: string;
  doctorId: string;
  date: Date | undefined;
  time: string;
  reason: string;
  notes: string;
}

export default function Appointments() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const preselectedDoctor = searchParams.get('doctor');
  
  const [formData, setFormData] = useState<AppointmentData>({
    patientName: '',
    email: '',
    phone: '',
    doctorId: preselectedDoctor || '',
    date: undefined,
    time: '',
    reason: '',
    notes: ''
  });

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const selectedDoctor = doctors.find(doc => doc.id === formData.doctorId);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'doctors'));
        const doctorsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          specialty: doc.data().specialty,
          consultationFee: doc.data().consultationFee || 0
        })) as Doctor[];
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  const handleInputChange = (field: keyof AppointmentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBookAppointment = () => {
    // Validate required fields
    if (!formData.patientName || !formData.email || !formData.phone || 
        !formData.doctorId || !selectedDate || !formData.time || !formData.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Show payment modal if doctor has consultation fee
    if (selectedDoctor?.consultationFee && selectedDoctor.consultationFee > 0) {
      setShowPaymentModal(true);
    } else {
      proceedWithBooking();
    }
  };

  const proceedWithBooking = async () => {
    setLoading(true);
    setShowPaymentModal(false);

    try {
      // Check for existing appointments at the same time
      const existingAppointments = await getDocs(
        query(
          collection(db, 'appointments'),
          where('doctorId', '==', formData.doctorId),
          where('date', '==', selectedDate!.toISOString().split('T')[0]),
          where('time', '==', formData.time)
        )
      );

      if (!existingAppointments.empty) {
        toast({
          title: "Time Slot Unavailable",
          description: "This time slot is already booked. Please choose another time.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const appointmentData = {
        ...formData,
        date: selectedDate!.toISOString().split('T')[0],
        status: 'pending',
        consultationFee: selectedDoctor?.consultationFee || 0,
        paymentMethod: 'UPI',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'appointments'), appointmentData);

      setShowSuccessModal(true);

      // Reset form
      setFormData({
        patientName: '',
        email: '',
        phone: '',
        doctorId: '',
        date: undefined,
        time: '',
        reason: '',
        notes: ''
      });
      setSelectedDate(undefined);

    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error booking your appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    // Store the selected payment method and proceed
    const appointmentDataWithPayment = {
      ...formData,
      date: selectedDate!.toISOString().split('T')[0],
      status: 'confirmed',
      consultationFee: selectedDoctor?.consultationFee || 0,
      paymentMethod: method,
      createdAt: new Date().toISOString()
    };

    // Simulate payment processing and then book appointment
    proceedWithBooking();
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book an Appointment</h1>
          <p className="text-lg text-gray-600">
            Schedule your visit with our healthcare professionals. Please fill out all required information.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleBookAppointment(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="patientName">Full Name *</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="doctor">Select Doctor *</Label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value) => handleInputChange('doctorId', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Preferred Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setFormData(prev => ({ ...prev, date }));
                        }}
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="time">Preferred Time *</Label>
                  <Select
                    value={formData.time}
                    onValueChange={(value) => handleInputChange('time', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason for Visit *</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder="e.g., Regular checkup, Follow-up, Consultation"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional information or special requirements"
                  rows={3}
                />
              </div>
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Booking...' : 'Book Appointment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Consultation Fee
            </h3>
            <p className="text-gray-600 mb-4">
              Dr. {selectedDoctor?.name} - {selectedDoctor?.specialty}
            </p>
            <p className="text-3xl font-bold text-green-600 mb-6">
              ₹{selectedDoctor?.consultationFee}
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Choose Payment Method:</h4>
            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={() => handlePaymentMethodSelect('PhonePe')} 
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                PhonePe
              </Button>
              <Button 
                onClick={() => handlePaymentMethodSelect('UPI')} 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                UPI
              </Button>
              <Button 
                onClick={() => handlePaymentMethodSelect('Net Banking')} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Net Banking
              </Button>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowPaymentModal(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Appointment Booked Successfully!
            </h3>
            <p className="text-gray-600">
              Your appointment has been successfully scheduled. We'll send you a confirmation email shortly.
            </p>
          </div>
          <Button onClick={() => setShowSuccessModal(false)} className="w-full">
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
