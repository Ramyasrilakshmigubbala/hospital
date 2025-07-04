
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Mail, Phone, Calendar } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp: any;
}

export default function MessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const q = query(collection(db, 'contactMessages'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const messagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContactMessage[];
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, 'contactMessages', messageId));
      setMessages(messages.filter(msg => msg.id !== messageId));
      toast({
        title: "Message Deleted",
        description: "The message has been successfully deleted."
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    try {
      return timestamp.toDate().toLocaleString();
    } catch {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contact Messages ({messages.length})</h3>
        <Button onClick={fetchMessages} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No messages received yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{message.name}</CardTitle>
                  <Button
                    onClick={() => deleteMessage(message.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${message.email}`} className="hover:text-blue-600">
                    {message.email}
                  </a>
                </div>
                
                {message.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <a href={`tel:${message.phone}`} className="hover:text-blue-600">
                      {message.phone}
                    </a>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(message.timestamp)}
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Message:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {message.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
