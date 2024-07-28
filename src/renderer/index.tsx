import React from 'react'; // Import React
import { createRoot } from 'react-dom/client';
import './index.css';
import Application from './components/application';

const domNode = document.getElementById('root') as HTMLElement;
const root = createRoot(domNode);
root.render(<Application />);
