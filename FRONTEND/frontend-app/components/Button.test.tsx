import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with correct label', () => {
    render(<Button label="Click Me" onClick={() => {}} />);
    const buttonElement = screen.getByText('Click Me');
    expect(buttonElement).toBeInTheDocument();
  });

  test('applies custom className when provided', () => {
    render(<Button label="Styled Button" onClick={() => {}} className="custom-class" />);
    const button = screen.getByText('Styled Button');
    expect(button).toHaveClass('custom-class');
  });

  test('has default blue styling', () => {
    render(<Button label="Default Button" onClick={() => {}} />);
    const button = screen.getByText('Default Button');
    expect(button).toHaveClass('bg-blue-500');
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Clickable" onClick={handleClick} />);
    const button = screen.getByText('Clickable');
    
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
