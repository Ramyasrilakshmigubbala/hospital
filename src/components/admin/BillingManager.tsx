
import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, CreditCard, DollarSign, Users } from 'lucide-react';

interface BillingRecord {
  id: string;
  patientName: string;
  email: string;
  amount: number;
  paymentMethod: string;
  status: 'paid' | 'refunded' | 'pending';
  appointmentId?: string;
  createdAt: string;
}

export default function BillingManager() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      // Fetch appointments with payment information
      const appointmentsQuery = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      
      const billingData: BillingRecord[] = [];
      
      appointmentsSnapshot.docs.forEach(doc => {
        const appointment = doc.data();
        if (appointment.consultationFee && appointment.consultationFee > 0) {
          billingData.push({
            id: doc.id,
            patientName: appointment.patientName,
            email: appointment.email,
            amount: appointment.consultationFee,
            paymentMethod: appointment.paymentMethod || 'UPI',
            status: appointment.status === 'cancelled' ? 'refunded' : 'paid',
            appointmentId: doc.id,
            createdAt: appointment.createdAt
          });
        }
      });

      setBillingRecords(billingData);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch billing data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBillingData();
    toast({
      title: "Refreshed",
      description: "Billing data has been refreshed."
    });
  };

  const processRefund = async (recordId: string) => {
    if (!confirm('Are you sure you want to process this refund?')) {
      return;
    }

    try {
      // Update the appointment status to cancelled (which triggers refund status)
      await updateDoc(doc(db, 'appointments', recordId), {
        status: 'cancelled',
        refundProcessed: true,
        refundDate: new Date().toISOString()
      });

      // Update local state
      setBillingRecords(prev =>
        prev.map(record =>
          record.id === recordId ? { ...record, status: 'refunded' } : record
        )
      );

      toast({
        title: "Refund Processed",
        description: "The refund has been processed successfully."
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: "Refund Failed",
        description: "There was an error processing the refund.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = billingRecords
    .filter(record => record.status === 'paid')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalRefunds = billingRecords
    .filter(record => record.status === 'refunded')
    .reduce((sum, record) => sum + record.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              From {billingRecords.filter(r => r.status === 'paid').length} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRefunds}</div>
            <p className="text-xs text-muted-foreground">
              From {billingRecords.filter(r => r.status === 'refunded').length} refunds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingRecords.length}</div>
            <p className="text-xs text-muted-foreground">All billing records</p>
          </CardContent>
        </Card>
      </div>

      {/* Billing Records Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Billing Records</CardTitle>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {billingRecords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No billing records found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.patientName}</TableCell>
                    <TableCell>{record.email}</TableCell>
                    <TableCell>₹{record.amount}</TableCell>
                    <TableCell>{record.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {record.status === 'paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => processRefund(record.id)}
                        >
                          Process Refund
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
