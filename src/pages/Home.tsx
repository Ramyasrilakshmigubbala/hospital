
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Heart, Shield, Users, Clock, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomeContent {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage?: string;
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

export default function Home() {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        console.log('Fetching home content...');
        const querySnapshot = await getDocs(collection(db, 'homeContent'));
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data() as HomeContent;
          console.log('Home content fetched:', data);
          if (!data.features || !Array.isArray(data.features)) {
            data.features = [];
          }
          setContent(data);
        }
      } catch (error) {
        console.error('Error fetching home content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const defaultContent: HomeContent = {
    title: "CareLink Health Hospital",
    subtitle: "Your Health, Our Priority",
    description: "Providing comprehensive medical care with compassion, expertise, and cutting-edge technology to ensure the best possible outcomes for our patients.",
    backgroundImage: "",
    features: [
      {
        title: "Expert Medical Care",
        description: "Our team of experienced physicians and specialists provide world-class medical care.",
        icon: "heart"
      },
      {
        title: "Advanced Technology",
        description: "State-of-the-art medical equipment and innovative treatment approaches.",
        icon: "shield"
      },
      {
        title: "Compassionate Service",
        description: "We treat every patient with dignity, respect, and personalized attention.",
        icon: "users"
      },
      {
        title: "24/7 Emergency Care",
        description: "Round-the-clock emergency services for when you need us most.",
        icon: "clock"
      }
    ]
  };

  const displayContent = content || defaultContent;
  const features = displayContent.features || defaultContent.features;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Create proper background image styling
  const heroStyle: React.CSSProperties = {};
  if (displayContent.backgroundImage && displayContent.backgroundImage.trim()) {
    console.log('Using background image:', displayContent.backgroundImage);
    heroStyle.backgroundImage = `linear-gradient(rgba(135, 206, 235, 0.8), rgba(255, 255, 255, 0.9)), url("${displayContent.backgroundImage}")`;
    heroStyle.backgroundSize = 'cover';
    heroStyle.backgroundPosition = 'center';
    heroStyle.backgroundRepeat = 'no-repeat';
    heroStyle.backgroundAttachment = 'fixed';
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Light Blue Theme and Background Image */}
      <section 
        className="bg-gradient-to-br from-sky-50 to-blue-100 text-gray-800 py-20 relative min-h-[600px] flex items-center"
        style={{
          ...(displayContent.backgroundImage && displayContent.backgroundImage.trim() && {
            backgroundImage: `linear-gradient(rgba(135, 206, 235, 0.8), rgba(255, 255, 255, 0.9)), url("${displayContent.backgroundImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          })
        }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8 w-full">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-blue-700 drop-shadow-md">
              {displayContent.title}
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-blue-600 drop-shadow-sm">
              {displayContent.subtitle}
            </p>
            <p className="text-lg mb-10 text-gray-700 max-w-3xl mx-auto drop-shadow-sm bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              {displayContent.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 shadow-lg">
                <Link to="/appointments">
                  Book Appointment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 bg-white shadow-lg">
                <Link to="/services">
                  Our Services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">
              Why Choose CareLink Health Hospital?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We are committed to providing exceptional healthcare services with a patient-centered approach.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-white to-sky-50 border-sky-200">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 rounded-full p-3">
                      {getIcon(feature.icon)}
                    </div>
                  </div>
                  <CardTitle className="text-lg font-semibold text-blue-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">
              Quick Access
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-xl transition-all duration-300 bg-white border-sky-200">
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-blue-800">Find a Doctor</h3>
                <p className="text-gray-600 mb-4">Browse our team of experienced specialists</p>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link to="/doctors">View Doctors</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 bg-white border-sky-200">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-blue-800">Health Records</h3>
                <p className="text-gray-600 mb-4">Access your medical records securely</p>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link to="/health-records">View Records</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 bg-white border-sky-200">
              <CardContent className="p-6 text-center">
                <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-blue-800">Contact Us</h3>
                <p className="text-gray-600 mb-4">Get in touch with our team</p>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link to="/contact">Contact</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Phone className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Call Us</h3>
              <p>(555) 123-4567</p>
            </div>
            <div>
              <Mail className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Email</h3>
              <p>info@carelinkhealthhospital.com</p>
            </div>
            <div>
              <MapPin className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Visit Us</h3>
              <p>123 Health Street, Medical City</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Notice */}
      <section className="bg-red-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Medical Emergency?</h2>
          <p className="text-lg mb-4">Call 911 immediately for life-threatening emergencies</p>
          <p className="text-sm">For urgent medical concerns, contact our 24/7 hotline: (555) 123-4567</p>
        </div>
      </section>
    </div>
  );
}

const getIcon = (iconName: string) => {
  switch (iconName.toLowerCase()) {
    case 'heart':
      return <Heart className="h-6 w-6 text-blue-600" />;
    case 'shield':
      return <Shield className="h-6 w-6 text-blue-600" />;
    case 'users':
      return <Users className="h-6 w-6 text-blue-600" />;
    case 'clock':
      return <Clock className="h-6 w-6 text-blue-600" />;
    default:
      return <Heart className="h-6 w-6 text-blue-600" />;
  }
};
