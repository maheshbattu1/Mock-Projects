'use client';

import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { SliderArrow } from './SliderArrow';
import { PropertySkeletonLoader } from './PropertySkeleton';

interface Home {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
}

export default function MostDemandedHomes() {
  const [homes, setHomes] = useState<Home[]>([]);
  useEffect(() => {
    const fetchHomes = async () => {
      const response = await fetch('/mostDemandable.json');
      const data = await response.json();
      // Use all properties for the slider without having to click
      setHomes(data);
    };

    fetchHomes();
  }, []);  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    pauseOnHover: false,
    swipe: false,
    touchMove: false,
    cssEase: "linear",
    className: "property-slider",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 3000,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 3000,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 3000,
        }
      }
    ]
  };  return (
    <section className="px-6 py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-800">Most Demanded Homes</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our most popular properties across the country. These high-demand homes are loved by our clients for their exceptional amenities and prime locations.
          </p>
        </div>
        {homes.length > 0 ? (          <>
            <Slider {...sliderSettings}>          {homes.map((home) => (
            <div key={home.id} className="px-2">
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 h-full border border-gray-100">
                <div className="relative h-48 rounded-t-lg overflow-hidden">
                  <img
                    src={home.image}
                    alt={home.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-0 right-0 bg-blue-600 text-white py-1 px-2 m-2 rounded-md text-sm font-medium">
                    Featured
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">{home.title}</h3>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {home.location}
                  </p>
                  <p className="text-blue-600 font-medium mt-2 text-lg">{home.price}</p>
                  <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-300">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}        </Slider>
            <div className="text-center mt-8">
              <a href="/properties" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300">
                View All Properties
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </>
      ) : (        <PropertySkeletonLoader />
      )}
      </div>
    </section>
  );
}
