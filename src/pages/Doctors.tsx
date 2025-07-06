
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { MapPin, Star, Calendar } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  bio: string;
  specialty: string;
  image?: string;
  availability?: string[];
  rating?: number;
  location?: string;
  consultationFee?: number;
}

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        console.log('Fetching doctors...');
        const querySnapshot = await getDocs(collection(db, 'doctors'));
        const doctorsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Doctor[];
        console.log('Doctors fetched:', doctorsData);
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Doctors</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet our team of experienced healthcare professionals at CareLink Health Hospital dedicated to providing you with the best medical care.
          </p>
        </div>

        {doctors.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-lg p-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
              <p className="text-gray-600">We're updating our doctor profiles for you.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="w-32 h-32">
                      <AvatarImage 
                        src={doctor.image} 
                        alt={doctor.name}
                        onError={(e) => {
                          console.log('Doctor image failed to load:', doctor.image);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold w-32 h-32">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl mb-2">Dr. {doctor.name}</CardTitle>
                  <Badge variant="secondary" className="w-fit mx-auto mb-2">{doctor.specialty}</Badge>
                  
                  {doctor.rating && doctor.rating > 0 && (
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{doctor.rating}/5</span>
                    </div>
                  )}
                  
                  {doctor.location && (
                    <div className="flex items-center justify-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {doctor.location}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.bio && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Biography</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">{doctor.bio}</p>
                    </div>
                  )}
                  
                  {doctor.availability && doctor.availability.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Availability
                      </h4>
                      <p className="text-sm text-gray-600">{doctor.availability.join(', ')}</p>
                    </div>
                  )}
                  
                  {doctor.consultationFee && doctor.consultationFee > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Consultation Fee</h4>
                      <p className="text-sm font-semibold text-green-600">₹{doctor.consultationFee}</p>
                    </div>
                  )}
                  
                  <Button asChild className="w-full">
                    <Link to={`/appointments?doctor=${doctor.id}`}>
                      Book Appointment
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
