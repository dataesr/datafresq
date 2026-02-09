// =============================================================================
// HOME PAGE
// =============================================================================

import { Breadcrumb } from '@/components/Breadcrumb';
import Features from './components/Features';
import Hero from './components/Hero';
import Stats from './components/Stats';
import './styles.css';

export default function Home() {
  return (
    <div className="home">
      <Breadcrumb items={[{ label: 'Accueil', current: true }]} hidden />
      <Hero />
      <Stats />
      <Features />
    </div>
  );
}
