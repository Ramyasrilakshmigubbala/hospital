
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Heart, Shield, Users, Clock, Star, Award, CheckCircle } from 'lucide-react';
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
        const querySnapshot = await getDocs(collection(db, 'homeContent'));
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data() as HomeContent;
          // Ensure features array exists
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
    title: "Excellence in Healthcare",
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
  
  // Ensure features array is always available
  const features = displayContent.features || defaultContent.features;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const heroStyle = displayContent.backgroundImage 
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${displayContent.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {};

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section 
        className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-24 relative overflow-hidden"
        style={heroStyle}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              {displayContent.title}
            </h1>
            <p className="text-xl md:text-3xl mb-4 text-blue-100 font-medium">
              {displayContent.subtitle}
            </p>
            <p className="text-lg mb-10 text-blue-200 max-w-4xl mx-auto leading-relaxed">
              {displayContent.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transition-all duration-300 px-10 py-4 text-lg font-semibold rounded-full">
                <Link to="/appointments">
                  Book Appointment
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-2xl hover:shadow-3xl transition-all duration-300 px-10 py-4 text-lg font-semibold rounded-full backdrop-blur-sm">
                <Link to="/services">
                  Our Services
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl"></div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 rounded-full p-3">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Why Choose Our Hospital?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We are committed to providing exceptional healthcare services with a patient-centered approach and cutting-edge medical technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-2xl transition-all duration-300 border-0 shadow-lg group hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      {getIcon(feature.icon, true)}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="flex justify-center mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Take Care of Your Health?
          </h2>
          <p className="text-xl mb-10 text-blue-100 leading-relaxed">
            Schedule an appointment with our experienced medical professionals today and take the first step towards better health.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transition-all duration-300 px-10 py-4 text-lg font-semibold rounded-full">
              <Link to="/appointments">
                Schedule Appointment
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-2xl hover:shadow-3xl transition-all duration-300 px-10 py-4 text-lg font-semibold rounded-full backdrop-blur-sm">
              <Link to="/doctors">
                Meet Our Doctors
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-0 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-0 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl"></div>
      </section>

      {/* Enhanced Emergency Contact Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16 relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Medical Emergency?
          </h2>
          <p className="text-xl mb-8 leading-relaxed">
            For life-threatening emergencies, call 911 immediately. For urgent medical concerns, contact our 24/7 hotline.
          </p>
          <Button asChild size="lg" className="bg-white text-red-600 hover:bg-red-50 shadow-2xl hover:shadow-3xl transition-all duration-300 px-10 py-4 text-lg font-semibold rounded-full">
            <Link to="/contact">
              Emergency Contact
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

const getIcon = (iconName: string, isWhite = false) => {
  const colorClass = isWhite ? "text-white" : "text-blue-600";
  switch (iconName.toLowerCase()) {
    case 'heart':
      return <Heart className={`h-8 w-8 ${colorClass}`} />;
    case 'shield':
      return <Shield className={`h-8 w-8 ${colorClass}`} />;
    case 'users':
      return <Users className={`h-8 w-8 ${colorClass}`} />;
    case 'clock':
      return <Clock className={`h-8 w-8 ${colorClass}`} />;
    default:
      return <Heart className={`h-8 w-8 ${colorClass}`} />;
  }
};
