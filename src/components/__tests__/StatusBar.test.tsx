import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBar } from '../StatusBar';

describe('StatusBar', () => {
  it('renders without crashing', () => {
    render(
      <StatusBar
        completionPercent={50}
        requiredFieldsComplete={5}
        totalRequiredFields={10}
      />
    );
    expect(screen.getByText(/Progress:/)).toBeInTheDocument();
  });

  it('displays completion percentage correctly', () => {
    render(
      <StatusBar
        completionPercent={75}
        requiredFieldsComplete={15}
        totalRequiredFields={20}
      />
    );
    expect(screen.getByText(/75%/)).toBeInTheDocument();
  });

  it('shows field completion count', () => {
    render(
      <StatusBar
        completionPercent={60}
        requiredFieldsComplete={6}
        totalRequiredFields={10}
      />
    );
    expect(screen.getByText(/6\/10 fields/)).toBeInTheDocument();
  });

  it('displays check icon when 100% complete', () => {
    const { container } = render(
      <StatusBar
        completionPercent={100}
        requiredFieldsComplete={10}
        totalRequiredFields={10}
      />
    );
    // CheckCircle icon should be present
    const svg = container.querySelector('svg.text-success');
    expect(svg).toBeInTheDocument();
  });

  it('displays alert icon when incomplete', () => {
    const { container } = render(
      <StatusBar
        completionPercent={50}
        requiredFieldsComplete={5}
        totalRequiredFields={10}
      />
    );
    // AlertCircle icon should be present
    const svg = container.querySelector('svg.text-warning');
    expect(svg).toBeInTheDocument();
  });

  it('shows version information', () => {
    render(
      <StatusBar
        completionPercent={50}
        requiredFieldsComplete={5}
        totalRequiredFields={10}
      />
    );
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('rounds completion percentage to nearest integer', () => {
    render(
      <StatusBar
        completionPercent={66.7}
        requiredFieldsComplete={2}
        totalRequiredFields={3}
      />
    );
    expect(screen.getByText(/67%/)).toBeInTheDocument();
  });
});
