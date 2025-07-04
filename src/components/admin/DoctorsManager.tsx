
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
      const querySnapshot = await getDocs(collection(db, 'doctors'));
      const doctorsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const doctorData = {
        name: formData.name,
        bio: formData.bio,
        specialty: formData.specialty,
        image: formData.image || undefined,
        availability: formData.availability.split(',').map(day => day.trim()).filter(day => day),
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        location: formData.location || undefined
      };

      if (editingDoctor) {
        await updateDoc(doc(db, 'doctors', editingDoctor.id), doctorData);
        toast({ title: "Doctor Updated", description: "Doctor profile has been successfully updated." });
      } else {
        await addDoc(collection(db, 'doctors'), doctorData);
        toast({ title: "Doctor Added", description: "New doctor has been successfully added." });
      }

      setFormData({ name: '', bio: '', specialty: '', image: '', availability: '', rating: '', location: '' });
      setEditingDoctor(null);
      fetchDoctors();
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the doctor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      bio: doctor.bio,
      specialty: doctor.specialty,
      image: doctor.image || '',
      availability: doctor.availability.join(', '),
      rating: doctor.rating?.toString() || '',
      location: doctor.location || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      try {
        await deleteDoc(doc(db, 'doctors', id));
        toast({ title: "Doctor Deleted", description: "Doctor has been successfully deleted." });
        fetchDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        toast({
          title: "Delete Failed",
          description: "There was an error deleting the doctor. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold">
          {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Doctor Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) => handleInputChange('specialty', e.target.value)}
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
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="bio">Biography</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
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
              onClick={() => {
                setEditingDoctor(null);
                setFormData({ name: '', bio: '', specialty: '', image: '', availability: '', rating: '', location: '' });
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardHeader>
              <CardTitle className="text-lg">Dr. {doctor.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{doctor.specialty}</p>
              <p className="text-sm mb-2">{doctor.bio}</p>
              {doctor.availability.length > 0 && (
                <p className="text-sm text-gray-600 mb-2">
                  Available: {doctor.availability.join(', ')}
                </p>
              )}
              {doctor.rating && (
                <p className="text-sm text-gray-600 mb-4">Rating: {doctor.rating}/5</p>
              )}
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(doctor)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(doctor.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
