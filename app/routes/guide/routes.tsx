import { Route } from 'react-router';
import GuideLayout from './layout';
import GuideIndex from './index';
import GuidePage from './components/GuidePage';

export const guideRoutes = (
  <Route path="guide" element={<GuideLayout />}>
    <Route index element={<GuideIndex />} />
    <Route path="*" element={<GuidePage />} />
  </Route>
);
