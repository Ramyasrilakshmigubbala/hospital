
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Mail, Phone, Calendar, RefreshCw } from 'lucide-react';

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
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setRefreshing(true);
    try {
      const q = query(collection(db, 'contactMessages'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const messagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContactMessage[];
      setMessages(messagesData);
      
      if (!loading) {
        toast({
          title: "Messages Refreshed",
          description: `Found ${messagesData.length} messages.`
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Refresh Failed",
        description: "There was an error fetching messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
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
        <h3 className="text-lg font-semibold flex items-center">
          <Mail className="mr-2 h-5 w-5" />
          Contact Messages ({messages.length})
        </h3>
        <Button 
          onClick={fetchMessages} 
          variant="outline" 
          size="sm" 
          disabled={refreshing}
          className="flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Messages Yet</h3>
            <p className="text-gray-500">Contact form submissions will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {messages.map((message) => (
            <Card key={message.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    {message.name}
                  </CardTitle>
                  <Button
                    onClick={() => deleteMessage(message.id)}
                    variant="destructive"
                    size="sm"
                    className="hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <Mail className="h-4 w-4 mr-2 text-green-600" />
                    <a href={`mailto:${message.email}`} className="hover:text-blue-600 font-medium">
                      {message.email}
                    </a>
                  </div>
                  
                  {message.phone && (
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <Phone className="h-4 w-4 mr-2 text-blue-600" />
                      <a href={`tel:${message.phone}`} className="hover:text-blue-600 font-medium">
                        {message.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="font-medium">{formatDate(message.timestamp)}</span>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                    Message:
                  </h4>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {message.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
