
import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  bio: string;
  specialty: string;
  image?: string;
  availability: string[];
  rating?: number;
  location?: string;
}

export default function DoctorsManager() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    specialty: '',
    image: '',
    availability: '',
    rating: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

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
      toast({
        title: "Fetch Error",
        description: "Failed to load doctors. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.bio || !formData.specialty) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Bio, Specialty).",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const doctorData = {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        specialty: formData.specialty.trim(),
        image: formData.image.trim() || '',
        availability: formData.availability ? formData.availability.split(',').map(day => day.trim()).filter(day => day) : [],
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        location: formData.location.trim() || ''
      };

      console.log('Saving doctor data:', doctorData);

      if (editingDoctor) {
        await updateDoc(doc(db, 'doctors', editingDoctor.id), doctorData);
        toast({ 
          title: "Success", 
          description: "Doctor profile updated successfully!" 
        });
      } else {
        await addDoc(collection(db, 'doctors'), doctorData);
        toast({ 
          title: "Success", 
          description: "New doctor added successfully!" 
        });
      }

      // Reset form
      setFormData({ 
        name: '', 
        bio: '', 
        specialty: '', 
        image: '', 
        availability: '', 
        rating: '', 
        location: '' 
      });
      setEditingDoctor(null);
      await fetchDoctors();
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast({
        title: "Save Error",
        description: "Failed to save doctor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    console.log('Editing doctor:', doctor);
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      bio: doctor.bio,
      specialty: doctor.specialty,
      image: doctor.image || '',
      availability: doctor.availability ? doctor.availability.join(', ') : '',
      rating: doctor.rating?.toString() || '',
      location: doctor.location || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) {
      return;
    }

    try {
      console.log('Deleting doctor:', id);
      await deleteDoc(doc(db, 'doctors', id));
      toast({ 
        title: "Success", 
        description: "Doctor deleted successfully!" 
      });
      await fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete doctor. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setEditingDoctor(null);
    setFormData({ 
      name: '', 
      bio: '', 
      specialty: '', 
      image: '', 
      availability: '', 
      rating: '', 
      location: '' 
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Doctor Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Dr. John Smith"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="specialty">Specialty *</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  placeholder="Cardiology"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value)}
                  placeholder="4.5"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Main Hospital, Floor 2"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="bio">Biography *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Brief description of the doctor's experience and expertise..."
                required
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="availability">Availability (comma-separated days)</Label>
              <Input
                id="availability"
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                placeholder="Monday, Wednesday, Friday"
              />
            </div>
            
            <div>
              <Label htmlFor="image">Image URL (Optional)</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/doctor-image.jpg"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingDoctor ? 'Update Doctor' : 'Add Doctor'}
              </Button>
              {editingDoctor && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardHeader>
              <CardTitle className="text-lg">Dr. {doctor.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{doctor.specialty}</p>
              <p className="text-sm mb-2 line-clamp-3">{doctor.bio}</p>
              {doctor.availability && doctor.availability.length > 0 && (
                <p className="text-sm text-gray-600 mb-2">
                  Available: {doctor.availability.join(', ')}
                </p>
              )}
              {doctor.rating && doctor.rating > 0 && (
                <p className="text-sm text-gray-600 mb-4">Rating: {doctor.rating}/5</p>
              )}
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(doctor)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(doctor.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {doctors.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No doctors added yet. Add your first doctor above!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
