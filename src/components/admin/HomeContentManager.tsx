
import { useState, useEffect } from 'react';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface HomeContent {
  title: string;
  subtitle: string;
  description: string;
  features: Feature[];
}

export default function HomeContentManager() {
  const [content, setContent] = useState<HomeContent>({
    title: '',
    subtitle: '',
    description: '',
    features: []
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'homeContent'));
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data() as HomeContent;
          // Ensure features array exists
          if (!data.features || !Array.isArray(data.features)) {
            data.features = [];
          }
          setContent(data);
        }
      } catch (error) {
        console.error('Error fetching home content:', error);
      }
    };

    fetchContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setDoc(doc(db, 'homeContent', 'main'), content);
      toast({
        title: "Content Updated",
        description: "Home page content has been successfully updated."
      });
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Omit<HomeContent, 'features'>, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    setContent(prev => ({
      ...prev,
      features: [...prev.features, { title: '', description: '', icon: 'heart' }]
    }));
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    setContent(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }));
  };

  const removeFeature = (index: number) => {
    setContent(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="title">Main Title</Label>
          <Input
            id="title"
            value={content.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Excellence in Healthcare"
          />
        </div>

        <div>
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={content.subtitle}
            onChange={(e) => handleInputChange('subtitle', e.target.value)}
            placeholder="Your Health, Our Priority"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={content.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Providing comprehensive medical care..."
            rows={3}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <Label>Features</Label>
          <Button type="button" onClick={addFeature} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>

        <div className="space-y-4">
          {content.features.map((feature, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Feature {index + 1}</CardTitle>
                  <Button 
                    type="button" 
                    onClick={() => removeFeature(index)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor={`feature-title-${index}`}>Title</Label>
                  <Input
                    id={`feature-title-${index}`}
                    value={feature.title}
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                    placeholder="Expert Medical Care"
                  />
                </div>
                <div>
                  <Label htmlFor={`feature-desc-${index}`}>Description</Label>
                  <Textarea
                    id={`feature-desc-${index}`}
                    value={feature.description}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    placeholder="Our team of experienced physicians..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor={`feature-icon-${index}`}>Icon</Label>
                  <select
                    id={`feature-icon-${index}`}
                    value={feature.icon}
                    onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="heart">Heart</option>
                    <option value="shield">Shield</option>
                    <option value="users">Users</option>
                    <option value="clock">Clock</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Content'}
      </Button>
    </form>
  );
}
