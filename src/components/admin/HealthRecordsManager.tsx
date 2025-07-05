import { useState, useEffect } from 'react';
import { collection, doc, setDoc, getDocs, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';

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

export default function HealthRecordsManager() {
  const [content, setContent] = useState<HealthRecordsContent>({
    uploadInstructions: '',
    policyContent: ''
  });
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    patientName: '',
    recordType: '',
    description: '',
    email: ''
  });
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
    fetchRecords();
  }, []);

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

  const fetchRecords = async () => {
    try {
      const q = query(collection(db, 'healthRecords'), orderBy('dateCreated', 'desc'));
      const querySnapshot = await getDocs(q);
      const recordsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HealthRecord[];
      setRecords(recordsData);
    } catch (error) {
      console.error('Error fetching health records:', error);
    }
  };

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

  const addRecord = async () => {
    if (!newRecord.patientName || !newRecord.recordType || !newRecord.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including email.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addDoc(collection(db, 'healthRecords'), {
        ...newRecord,
        dateCreated: new Date()
      });
      
      setNewRecord({ patientName: '', recordType: '', description: '', email: '' });
      setShowAddRecord(false);
      fetchRecords();
      
      toast({
        title: "Record Added",
        description: "Health record has been successfully added."
      });
    } catch (error) {
      console.error('Error adding record:', error);
      toast({
        title: "Add Failed",
        description: "There was an error adding the record. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateRecord = async () => {
    if (!editingRecord) return;

    try {
      await setDoc(doc(db, 'healthRecords', editingRecord.id), {
        patientName: editingRecord.patientName,
        recordType: editingRecord.recordType,
        description: editingRecord.description,
        email: editingRecord.email,
        dateCreated: editingRecord.dateCreated
      });
      
      setEditingRecord(null);
      fetchRecords();
      
      toast({
        title: "Record Updated",
        description: "Health record has been successfully updated."
      });
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the record. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteRecord = async (recordId: string) => {
    try {
      await deleteDoc(doc(db, 'healthRecords', recordId));
      fetchRecords();
      
      toast({
        title: "Record Deleted",
        description: "Health record has been successfully deleted."
      });
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the record. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Unknown date';
    try {
      return date.toDate ? date.toDate().toLocaleDateString() : new Date(date).toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="space-y-8">
      {/* Content Management */}
      <Card>
        <CardHeader>
          <CardTitle>Page Content</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Health Records Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Health Records ({records.length})
            </CardTitle>
            <Button onClick={() => setShowAddRecord(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add New Record Form */}
          {showAddRecord && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add New Health Record</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Patient Name *</Label>
                  <Input
                    value={newRecord.patientName}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, patientName: e.target.value }))}
                    placeholder="Patient full name"
                  />
                </div>
                <div>
                  <Label>Patient Email *</Label>
                  <Input
                    type="email"
                    value={newRecord.email}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="patient@example.com"
                  />
                </div>
                <div>
                  <Label>Record Type *</Label>
                  <Input
                    value={newRecord.recordType}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, recordType: e.target.value }))}
                    placeholder="Lab Results, X-Ray, Blood Test, etc."
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newRecord.description}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about the record..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addRecord}>Add Record</Button>
                  <Button onClick={() => setShowAddRecord(false)} variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Records Table */}
          {records.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No health records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Patient Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Record Type</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Date Created</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {editingRecord?.id === record.id ? (
                          <Input
                            value={editingRecord.patientName}
                            onChange={(e) => setEditingRecord(prev => prev ? { ...prev, patientName: e.target.value } : null)}
                          />
                        ) : (
                          record.patientName
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {editingRecord?.id === record.id ? (
                          <Input
                            type="email"
                            value={editingRecord.email}
                            onChange={(e) => setEditingRecord(prev => prev ? { ...prev, email: e.target.value } : null)}
                          />
                        ) : (
                          record.email
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {editingRecord?.id === record.id ? (
                          <Input
                            value={editingRecord.recordType}
                            onChange={(e) => setEditingRecord(prev => prev ? { ...prev, recordType: e.target.value } : null)}
                          />
                        ) : (
                          record.recordType
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {editingRecord?.id === record.id ? (
                          <Textarea
                            value={editingRecord.description}
                            onChange={(e) => setEditingRecord(prev => prev ? { ...prev, description: e.target.value } : null)}
                            rows={2}
                          />
                        ) : (
                          record.description || 'N/A'
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {formatDate(record.dateCreated)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2 justify-center">
                          {editingRecord?.id === record.id ? (
                            <>
                              <Button onClick={updateRecord} size="sm">Save</Button>
                              <Button onClick={() => setEditingRecord(null)} size="sm" variant="outline">Cancel</Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                onClick={() => setEditingRecord(record)} 
                                size="sm" 
                                variant="outline"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                onClick={() => deleteRecord(record.id)} 
                                size="sm" 
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
