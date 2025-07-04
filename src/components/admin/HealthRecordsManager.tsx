
import { useState, useEffect } from 'react';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface HealthRecordsContent {
  uploadInstructions: string;
  policyContent: string;
}

export default function HealthRecordsManager() {
  const [content, setContent] = useState<HealthRecordsContent>({
    uploadInstructions: '',
    policyContent: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'healthRecordsContent'));
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setContent(doc.data() as HealthRecordsContent);
        }
      } catch (error) {
        console.error('Error fetching health records content:', error);
      }
    };

    fetchContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setDoc(doc(db, 'healthRecordsContent', 'main'), content);
      toast({
        title: "Content Updated",
        description: "Health records content has been successfully updated."
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

  const handleInputChange = (field: keyof HealthRecordsContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="uploadInstructions">Upload Instructions</Label>
        <Textarea
          id="uploadInstructions"
          value={content.uploadInstructions}
          onChange={(e) => handleInputChange('uploadInstructions', e.target.value)}
          placeholder="Instructions for patients on how to access their health records..."
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="policyContent">Privacy Policy Content</Label>
        <Textarea
          id="policyContent"
          value={content.policyContent}
          onChange={(e) => handleInputChange('policyContent', e.target.value)}
          placeholder="Privacy policy and security information..."
          rows={4}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Content'}
      </Button>
    </form>
  );
}
