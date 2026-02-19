import { lazy } from 'react';
import { Route } from 'react-router';

const GuideLayout = lazy(() => import('./layout'));
const GuideIndex = lazy(() => import('./index'));
const GuidePage = lazy(() => import('./components/GuidePage'));

export const guideRoutes = (
  <Route path="guide" element={<GuideLayout />}>
    <Route index element={<GuideIndex />} />
    <Route path="*" element={<GuidePage />} />
  </Route>
);
