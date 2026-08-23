import { describe, it, expect } from 'vitest';
import {
  organizationSchema,
  websiteSchema,
  softwareApplicationSchema,
  breadcrumbSchema,
} from './structured-data';

describe('structured data generation', () => {
  it('generates a stable Organization schema', () => {
    const schema = organizationSchema();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Organization');
    expect(schema['@id']).toBe('https://usemindpulse.com/#organization');
    expect(schema.name).toBe('Northlight');
    expect(schema.url).toBe('https://usemindpulse.com');
    // Ensure no undefined or garbage properties are attached
    expect(Object.keys(schema)).toEqual(['@context', '@type', '@id', 'name', 'url']);
  });

  it('generates a stable WebSite schema linking to the Organization', () => {
    const schema = websiteSchema();
    expect(schema['@type']).toBe('WebSite');
    expect(schema['@id']).toBe('https://usemindpulse.com/#website');
    expect(schema.publisher).toEqual({ '@id': 'https://usemindpulse.com/#organization' });
    // Verify multilingual representation
    expect(schema.inLanguage).toEqual(['en', 'ru', 'kk', 'es']);
  });

  it('generates a SoftwareApplication schema without fabricating reviews', () => {
    const schema = softwareApplicationSchema();
    expect(schema['@type']).toBe('SoftwareApplication');
    expect(schema['@id']).toBe('https://usemindpulse.com/#software');
    expect(schema.applicationCategory).toBe('EducationalApplication');
    expect(schema.offers).toEqual({
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    });
    // Ensure rating/review fields are STRICTLY absent
    expect(schema).not.toHaveProperty('aggregateRating');
    expect(schema).not.toHaveProperty('review');
    expect(schema.publisher).toEqual({ '@id': 'https://usemindpulse.com/#organization' });
  });

  it('generates a BreadcrumbList with accurate absolute URLs', () => {
    const schema = breadcrumbSchema([
      { name: 'MindPulse', url: 'https://usemindpulse.com/en' },
      { name: 'AI Study Planner', url: 'https://usemindpulse.com/en/ai-study-planner' },
    ]);
    
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(2);
    
    const first = schema.itemListElement[0]!;
    expect(first.position).toBe(1);
    expect(first.name).toBe('MindPulse');
    expect(first.item).toBe('https://usemindpulse.com/en');
    
    const second = schema.itemListElement[1]!;
    expect(second.position).toBe(2);
    expect(second.name).toBe('AI Study Planner');
    expect(second.item).toBe('https://usemindpulse.com/en/ai-study-planner');
  });
});
