
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

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
}

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'services'));
      const servicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), formData);
        toast({ title: "Service Updated", description: "Service has been successfully updated." });
      } else {
        await addDoc(collection(db, 'services'), formData);
        toast({ title: "Service Added", description: "New service has been successfully added." });
      }

      setFormData({ name: '', description: '', category: '', image: '' });
      setEditingService(null);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the service. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      image: service.image || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteDoc(doc(db, 'services', id));
        toast({ title: "Service Deleted", description: "Service has been successfully deleted." });
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast({
          title: "Delete Failed",
          description: "There was an error deleting the service. Please try again.",
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
          {editingService ? 'Edit Service' : 'Add New Service'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            required
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="image">Image URL (Optional)</Label>
          <Input
            id="image"
            value={formData.image}
            onChange={(e) => handleInputChange('image', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="flex space-x-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
          </Button>
          {editingService && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setEditingService(null);
                setFormData({ name: '', description: '', category: '', image: '' });
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <CardTitle className="text-lg">{service.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{service.category}</p>
              <p className="text-sm mb-4">{service.description}</p>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(service.id)}>
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
