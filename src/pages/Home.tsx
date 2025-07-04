
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Heart, Shield, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomeContent {
  title: string;
  subtitle: string;
  description: string;
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
        const querySnapshot = await getDocs(collection(db, 'homeContent'));
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setContent(doc.data() as HomeContent);
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
    title: "Excellence in Healthcare",
    subtitle: "Your Health, Our Priority",
    description: "Providing comprehensive medical care with compassion, expertise, and cutting-edge technology to ensure the best possible outcomes for our patients.",
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

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'heart':
        return <Heart className="h-8 w-8 text-blue-600" />;
      case 'shield':
        return <Shield className="h-8 w-8 text-blue-600" />;
      case 'users':
        return <Users className="h-8 w-8 text-blue-600" />;
      case 'clock':
        return <Clock className="h-8 w-8 text-blue-600" />;
      default:
        return <Heart className="h-8 w-8 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {displayContent.title}
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-blue-100">
              {displayContent.subtitle}
            </p>
            <p className="text-lg mb-8 text-blue-200 max-w-3xl mx-auto">
              {displayContent.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/appointments">
                  Book Appointment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/services">
                  Our Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Hospital?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We are committed to providing exceptional healthcare services with a patient-centered approach.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayContent.features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {getIcon(feature.icon)}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Take Care of Your Health?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Schedule an appointment with our experienced medical professionals today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/appointments">
                Schedule Appointment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/doctors">
                Meet Our Doctors
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section className="bg-red-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Medical Emergency?
          </h2>
          <p className="text-lg mb-6">
            For life-threatening emergencies, call 911 immediately. For urgent medical concerns, contact our 24/7 hotline.
          </p>
          <Button asChild size="lg" className="bg-white text-red-600 hover:bg-red-50 shadow-lg hover:shadow-xl transition-all duration-300">
            <Link to="/contact">
              Emergency Contact
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
