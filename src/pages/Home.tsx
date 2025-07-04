
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Users, Award } from 'lucide-react';

interface HomeContent {
  banner: string;
  welcomeMessage: string;
  intro: string;
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

  const defaultContent = {
    banner: "Excellence in Healthcare",
    welcomeMessage: "Welcome to CareLink Health",
    intro: "Your trusted partner in comprehensive healthcare solutions"
  };

  const displayContent = content || defaultContent;

  const features = [
    {
      icon: Shield,
      title: "Trusted Care",
      description: "Board-certified physicians and state-of-the-art facilities"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock emergency services and patient support"
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Multidisciplinary team of healthcare professionals"
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "Accredited facility with highest quality standards"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              {displayContent.banner}
            </h1>
            <h2 className="text-xl sm:text-2xl mb-6 text-blue-100">
              {displayContent.welcomeMessage}
            </h2>
            <p className="text-lg sm:text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              {displayContent.intro}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Link to="/appointments">
                  Book Appointment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link to="/services">
                  Our Services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CareLink Health?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive healthcare services with a focus on quality, compassion, and innovation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Better Healthcare?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Schedule your appointment today and take the first step towards better health.
          </p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            <Link to="/appointments">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
