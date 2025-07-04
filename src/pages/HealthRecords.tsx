
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, Shield, Info } from 'lucide-react';

interface HealthRecordsContent {
  uploadInstructions: string;
  policyContent: string;
}

export default function HealthRecords() {
  const [content, setContent] = useState<HealthRecordsContent | null>(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const defaultContent = {
    uploadInstructions: "To access your health records, please contact our medical records department or visit our facility with proper identification.",
    policyContent: "We maintain strict privacy and security standards for all health records in compliance with HIPAA regulations."
  };

  const displayContent = content || defaultContent;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Health Records</h1>
          <p className="text-lg text-gray-600">
            Secure access to your medical records and health information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5 text-blue-600" />
                Access Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{displayContent.uploadInstructions}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-green-600" />
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{displayContent.policyContent}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-purple-600" />
              Available Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Medical Records</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Lab Results</li>
                  <li>• Imaging Reports</li>
                  <li>• Prescription History</li>
                  <li>• Visit Summaries</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Health Management</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Vaccination Records</li>
                  <li>• Allergy Information</li>
                  <li>• Treatment Plans</li>
                  <li>• Insurance Information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Important Notice</h3>
                <p className="text-blue-800 text-sm">
                  For security and privacy reasons, health records are not directly accessible through this portal. 
                  Please contact our medical records department at (555) 123-4567 or visit our facility to request access to your records.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
