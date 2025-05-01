// __tests__/pages/home.test.js
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    // Filter out Next.js specific props that aren't valid for HTML img elements
    const { fill, priority, ...imgProps } = props;
    return <img {...imgProps} />;
  },
}));

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  
  return {
    getItem: jest.fn((key) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Home Page', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
    jest.clearAllMocks();
    
    // Reset the localStorage mock implementation to default behavior
    window.localStorage.getItem.mockImplementation((key) => {
      return window.localStorage[key] || null;
    });
  });

  test('renders the landing page correctly without authentication', () => {
    render(<Home />);
    
    // Check if the title is rendered - using exact text to match what's in the page
    expect(screen.getByText("Online Healthcare for", { exact: false })).toBeInTheDocument();
    
    // Check for Fasilkom UI text as separate element (not part of "Online Healthcare for")
    const fasilkomElement = screen.getByText("Fasilkom UI");
    expect(fasilkomElement).toBeInTheDocument();
    
    // Check if Sign In and Register buttons are visible when not authenticated
    // Instead of using getByText which fails if multiple elements match, use getAllByText
    const signInButtons = screen.getAllByText(/Sign In/i);
    expect(signInButtons.length).toBeGreaterThan(0); // At least one "Sign In" button exists
    
    const registerButtons = screen.getAllByText(/Register as Patient/i);
    expect(registerButtons.length).toBeGreaterThan(0); // At least one "Register as Patient" button exists
    
    expect(screen.queryByText("Go to Dashboard")).not.toBeInTheDocument();
    
    // Check if features section is rendered
    expect(screen.getByText("Why Choose PandaCare?")).toBeInTheDocument();
    expect(screen.getByText("Online Consultations")).toBeInTheDocument();
    expect(screen.getByText("Convenient Scheduling")).toBeInTheDocument();
    expect(screen.getByText("Health Information")).toBeInTheDocument();
    
    // Check if how it works section is rendered
    expect(screen.getByText("How PandaCare Works")).toBeInTheDocument();
    expect(screen.getByText("Create an Account")).toBeInTheDocument();
    expect(screen.getByText("Find a Doctor")).toBeInTheDocument();
    expect(screen.getByText("Get Consultation")).toBeInTheDocument();
    
    // Check CTA section
    expect(screen.getByText("Ready to get started?")).toBeInTheDocument();
    expect(screen.getByText("Join PandaCare today.")).toBeInTheDocument();
  });

  test('renders dashboard link when user is authenticated', async () => {
    // Mock localStorage to return authenticated state
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'user') return JSON.stringify({ name: 'Test User' });
      return null;
    });
    
    render(<Home />);
    
    // Since state update is triggered in useEffect, we need to wait
    await waitFor(() => {
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    });
    
    // Verify that sign in button is not displayed in the main hero section
    // We need to be specific since there might be multiple "Sign In" instances in other parts of the page
    const heroSection = document.querySelector('.md\\:flex.md\\:items-center.md\\:space-x-8');
    const signInInHero = heroSection ? within(heroSection).queryByText('Sign In') : null;
    expect(signInInHero).toBeNull();
    
    // Similarly check for absence of "Register as Patient" in the hero section
    const registerPatientInHero = heroSection ? within(heroSection).queryByText('Register as Patient') : null;
    expect(registerPatientInHero).toBeNull();
  });

  test('handles localStorage errors gracefully', () => {
    // Spy on console.error before setting up the error-throwing mock
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock localStorage.getItem to throw an error ONLY for this test
    window.localStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    // We don't expect the render to fail, but we do expect the error to be caught
    render(<Home />);
    
    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalled();
    
    // Cleanup
    consoleSpy.mockRestore();
    
    // Reset the localStorage implementation back to normal for subsequent tests
    window.localStorage.getItem.mockImplementation((key) => {
      return window.localStorage[key] || null;
    });
  });

  test('navigates to login page when Sign In button is clicked', () => {
    render(<Home />);
    
    // Find Sign In buttons (there might be multiple in different sections)
    const signInButtons = screen.getAllByText(/Sign In/i);
    
    // Click the first Sign In button if there are any
    if (signInButtons.length > 0) {
      fireEvent.click(signInButtons[0]);
      
      // Check if the Link is working with correct href
      // In a unit test, we can't actually navigate, but we can check if the Link component 
      // is rendering with the correct href
      expect(signInButtons[0].closest('a')).toHaveAttribute('href', '/login');
    }
  });

  test('navigates to register page when Register buttons are clicked', () => {
    render(<Home />);
    
    // Find Register buttons (there might be multiple with similar text)
    const registerPatientButtons = screen.getAllByText(/Register as Patient/i);
    const registerNowButtons = screen.getAllByText(/Register Now/i);
    
    // Click the register as patient button if there are any
    if (registerPatientButtons.length > 0) {
      fireEvent.click(registerPatientButtons[0]);
      
      // Check if the Link is working with correct href
      expect(registerPatientButtons[0].closest('a')).toHaveAttribute('href', '/register/pacillian');
    }
    
    // Check the other register button if there are any
    if (registerNowButtons.length > 0) {
      expect(registerNowButtons[0].closest('a')).toHaveAttribute('href', '/register/pacillian');
    }
  });

  test('renders all three feature cards', () => {
    render(<Home />);
    
    const featureCards = [
      {
        title: 'Online Consultations',
        description: 'Chat with qualified healthcare professionals from the comfort of your home.'
      },
      {
        title: 'Convenient Scheduling',
        description: 'Book appointments with doctors based on their available working hours.'
      },
      {
        title: 'Health Information',
        description: 'Access reliable health articles and tips written by medical professionals.'
      }
    ];
    
    // Check each feature card
    featureCards.forEach(card => {
      expect(screen.getByText(card.title)).toBeInTheDocument();
      expect(screen.getByText(card.description)).toBeInTheDocument();
    });
  });

  test('renders hero image correctly', () => {
    render(<Home />);
    
    const heroImage = screen.getByAltText('Doctor consulting with patient online');
    expect(heroImage).toBeInTheDocument();
    
    // Check image attributes
    expect(heroImage).toHaveAttribute('src', '/hero-image.jpg');
    expect(heroImage).toHaveStyle('object-fit: cover');
  });
});