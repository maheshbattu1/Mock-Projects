import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MostDemandedHomes from '../components/MostDemandedHomes';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([
      {
        id: 1,
        title: 'Modern Apartment',
        location: 'Downtown',
        price: '$250,000',
        image: 'https://example.com/image1.jpg'
      },
      {
        id: 2,
        title: 'Luxury Villa',
        location: 'Suburbs',
        price: '$500,000',
        image: 'https://example.com/image2.jpg'
      },
      {
        id: 3,
        title: 'Cozy Cottage',
        location: 'Countryside',
        price: '$180,000',
        image: 'https://example.com/image3.jpg'
      }
    ])
  })
) as jest.Mock;

// Mock the slick-carousel components
jest.mock('react-slick', () => {
  return function MockSlider({ children }: { children: React.ReactNode }) {
    return <div data-testid="mock-slider">{children}</div>;
  };
});

describe('MostDemandedHomes Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<MostDemandedHomes />);
    expect(screen.getAllByTestId('property-skeleton')).toHaveLength(3);
  });

  test('renders homes after data is loaded', async () => {
    render(<MostDemandedHomes />);
    
    await waitFor(() => {
      expect(screen.getByText('Modern Apartment')).toBeInTheDocument();
      expect(screen.getByText('Luxury Villa')).toBeInTheDocument();
      expect(screen.getByText('Cozy Cottage')).toBeInTheDocument();
    });
    
    expect(screen.getByText('$250,000')).toBeInTheDocument();
    expect(screen.getByText('Downtown')).toBeInTheDocument();
  });

  test('makes API call on component mount', () => {
    render(<MostDemandedHomes />);
    expect(global.fetch).toHaveBeenCalledWith('/mostDemandable.json');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
