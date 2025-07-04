
import { useState, useEffect } from 'react';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface HomeContent {
  banner: string;
  welcomeMessage: string;
  intro: string;
}

export default function HomeContentManager() {
  const [content, setContent] = useState<HomeContent>({
    banner: '',
    welcomeMessage: '',
    intro: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'homeContent'));
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setContent(doc.data() as HomeContent);
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

  const handleInputChange = (field: keyof HomeContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="banner">Banner Text</Label>
        <Input
          id="banner"
          value={content.banner}
          onChange={(e) => handleInputChange('banner', e.target.value)}
          placeholder="Excellence in Healthcare"
        />
      </div>

      <div>
        <Label htmlFor="welcomeMessage">Welcome Message</Label>
        <Input
          id="welcomeMessage"
          value={content.welcomeMessage}
          onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
          placeholder="Welcome to CareLink Health"
        />
      </div>

      <div>
        <Label htmlFor="intro">Introduction Text</Label>
        <Textarea
          id="intro"
          value={content.intro}
          onChange={(e) => handleInputChange('intro', e.target.value)}
          placeholder="Your trusted partner in comprehensive healthcare solutions"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Content'}
      </Button>
    </form>
  );
}
