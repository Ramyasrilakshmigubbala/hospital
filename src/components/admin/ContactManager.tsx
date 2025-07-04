
import { useState, useEffect } from 'react';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ContactContent {
  phone: string;
  email: string;
  address: string;
  hours: string;
  chatWidget?: string;
}

export default function ContactManager() {
  const [content, setContent] = useState<ContactContent>({
    phone: '',
    email: '',
    address: '',
    hours: '',
    chatWidget: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'contactContent'));
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setContent(doc.data() as ContactContent);
        }
      } catch (error) {
        console.error('Error fetching contact content:', error);
      }
    };

    fetchContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setDoc(doc(db, 'contactContent', 'main'), content);
      toast({
        title: "Content Updated",
        description: "Contact information has been successfully updated."
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

  const handleInputChange = (field: keyof ContactContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={content.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={content.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="info@carelink.health"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={content.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="123 Healthcare Avenue, Medical City, MC 12345"
        />
      </div>

      <div>
        <Label htmlFor="hours">Business Hours</Label>
        <Textarea
          id="hours"
          value={content.hours}
          onChange={(e) => handleInputChange('hours', e.target.value)}
          placeholder="Monday - Friday: 8:00 AM - 6:00 PM&#10;Saturday: 9:00 AM - 4:00 PM&#10;Sunday: Emergency Only"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="chatWidget">Chat Widget Code (Optional)</Label>
        <Textarea
          id="chatWidget"
          value={content.chatWidget}
          onChange={(e) => handleInputChange('chatWidget', e.target.value)}
          placeholder="Paste your chat widget HTML code here..."
          rows={4}
        />
        <p className="text-sm text-gray-600 mt-1">
          Paste the HTML code for your chat widget (e.g., from Intercom, Zendesk, etc.)
        </p>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Contact Info'}
      </Button>
    </form>
  );
}
