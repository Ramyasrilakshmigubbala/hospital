import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Shield, Info, LogOut, User } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

interface HealthRecordsContent {
  uploadInstructions: string;
  policyContent: string;
}

interface HealthRecord {
  id: string;
  patientName: string;
  recordType: string;
  description: string;
  email: string;
  dateCreated: any;
}

export default function HealthRecords() {
  const [content, setContent] = useState<HealthRecordsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRecords, setUserRecords] = useState<HealthRecord[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const fetchUserRecords = async (email: string) => {
    try {
      const q = query(
        collection(db, 'healthRecords'),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HealthRecord[];
      setUserRecords(records);
    } catch (error) {
      console.error('Error fetching user records:', error);
    }
  };

  const handleLogin = async () => {
    if (loginEmail.trim()) {
      setUserEmail(loginEmail);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      await fetchUserRecords(loginEmail);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setLoginEmail('');
    setUserRecords([]);
  };

  const formatDate = (date: any) => {
    if (!date) return 'Unknown date';
    try {
      return date.toDate ? date.toDate().toLocaleDateString() : new Date(date).toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

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

        {!isLoggedIn ? (
          <>
            <div className="text-center mb-8">
              <Button onClick={() => setShowLoginModal(true)} size="lg" className="mb-4">
                <User className="mr-2 h-5 w-5" />
                Login to View Records
              </Button>
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
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                <span className="text-lg font-medium">Welcome, {userEmail}</span>
              </div>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-purple-600" />
                  Your Health Records ({userRecords.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No health records found for your account.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">Record Type</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 font-medium">
                              {record.recordType}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {record.description || 'N/A'}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {formatDate(record.dateCreated)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Important Notice</h3>
                <p className="text-blue-800 text-sm">
                  For security and privacy reasons, health records require login verification. 
                  Please contact our medical records department at (555) 123-4567 if you need assistance accessing your records.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Login Modal */}
      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} className="max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Health Records</h2>
            <p className="text-gray-600">Enter your email to view your records</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleLogin} className="flex-1" disabled={!loginEmail.trim()}>
                Access Records
              </Button>
              <Button onClick={() => setShowLoginModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
