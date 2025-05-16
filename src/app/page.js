'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is already logged in
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  }, []);
  
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="md:flex md:items-center md:space-x-8 lg:space-x-16">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Online Healthcare for <span className="text-blue-600">Fasilkom UI</span> Community
              </h1>
              <p className="mt-4 text-xl text-gray-600 max-w-2xl">
                PandaCare connects you with healthcare professionals for convenient online consultations, personalized medical advice, and quality care.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {isAuthenticated ? (
                  <Link href="/dashboard"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login"
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Sign In
                    </Link>
                    <Link href="/register/pacillian"
                      className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Register as Patient
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="h-64 sm:h-80 md:h-96 lg:h-112 w-full relative rounded-2xl overflow-hidden shadow-xl">
                <Image 
                  src="/hero-image.jpg" 
                  alt="Doctor consulting with patient online"
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose PandaCare?
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Designed specifically for the Fasilkom UI community
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center rounded-full text-2xl mb-4">
                  📞
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Online Consultations</h3>
                <p className="mt-2 text-gray-600">
                  Chat with qualified healthcare professionals from the comfort of your home.
                </p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center rounded-full text-2xl mb-4">
                  📋
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Convenient Scheduling</h3>
                <p className="mt-2 text-gray-600">
                  Book appointments with doctors based on their available working hours.
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                <div className="w-12 h-12 bg-purple-600 text-white flex items-center justify-center rounded-full text-2xl mb-4">
                  📚
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Health Information</h3>
                <p className="mt-2 text-gray-600">
                  Access reliable health articles and tips written by medical professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How it works section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How PandaCare Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Get healthcare assistance in three simple steps
            </p>
          </div>
          
          <div className="mt-16">
            <div className="relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-1/3 w-full h-0.5 bg-blue-200 -translate-y-1/2"></div>
              
              <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
                {/* Step 1 */}
                <div className="relative flex flex-col items-center">
                  <div className="w-12 h-12 bg-white border-2 border-blue-500 text-blue-600 font-bold rounded-full flex items-center justify-center text-xl mb-4 z-10">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 text-center">Create an Account</h3>
                  <p className="mt-2 text-gray-600 text-center">
                    Register as a Pacillian to access all healthcare services.
                  </p>
                </div>
                
                {/* Step 2 */}
                <div className="relative flex flex-col items-center">
                  <div className="w-12 h-12 bg-white border-2 border-blue-500 text-blue-600 font-bold rounded-full flex items-center justify-center text-xl mb-4 z-10">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 text-center">Find a Doctor</h3>
                  <p className="mt-2 text-gray-600 text-center">
                    Browse doctors by specialty and schedule an appointment.
                  </p>
                </div>
                
                {/* Step 3 */}
                <div className="relative flex flex-col items-center">
                  <div className="w-12 h-12 bg-white border-2 border-blue-500 text-blue-600 font-bold rounded-full flex items-center justify-center text-xl mb-4 z-10">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 text-center">Get Consultation</h3>
                  <p className="mt-2 text-gray-600 text-center">
                    Chat with your doctor and receive medical advice online.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <Link href="/register/pacillian"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-200">Join PandaCare today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/register/pacillian"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Register Now
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link href="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}