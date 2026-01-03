// tests/dashboard.test.ts
import { render, screen } from '@testing-library/react';
import Dashboard from '../src/components/Dashboard';

describe('Dashboard Component', () => {
  test('renders buttons', () => {
    render(<Dashboard />);
    expect(screen.getByText('Load Reflections')).toBeTruthy();
  });

  test('AI summarize button exists', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Analyze Latest/)).toBeTruthy(); // Updated to match new Dashboard logic
  });
});

